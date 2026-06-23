"""
Recommendation service: calls the LLM agent + MCP to produce
the final fragrance recommendation for a completed test session.

Single responsibility: given an answers summary string, return
the LLM-generated recommendation text.
"""

import json
from mcp import ClientSession
from mcp.client.stdio import stdio_client

from utils.logger import get_logger
from utils.mcp_client import get_server_params
from utils.retry import run_with_retry
from agents.fragrance.prompts import fragrance_test_agent

log = get_logger(__name__)


async def _do_fragrance_recommendation(answers_summary: str) -> str:
    """
    Single attempt: open MCP session, call LLM agent with tool loop,
    return final text response.
    """
    server_params = get_server_params()

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            agent_history: list = []

            while True:
                response = fragrance_test_agent(answers_summary, agent_history)

                if response.tool_calls:
                    for tool_call in response.tool_calls:
                        args_dict = (
                            tool_call.args
                            if isinstance(tool_call.args, dict)
                            else json.loads(tool_call.args)
                        )
                        log.info("MCP tool call: %s args=%s", tool_call.name, args_dict)

                        mcp_res = await session.call_tool(tool_call.name, arguments=args_dict)

                        if mcp_res.isError:
                            result_data = f"MCP Error: {mcp_res.content}"
                            log.warning("MCP tool %s returned error: %s", tool_call.name, mcp_res.content)
                        else:
                            extracted = " ".join(
                                [c.text for c in mcp_res.content if hasattr(c, "text")]
                            )
                            try:
                                result_data = json.loads(extracted)
                            except json.JSONDecodeError as parse_err:
                                log.warning(
                                    "Could not parse MCP result as JSON: %s. Using raw text.",
                                    parse_err,
                                )
                                result_data = extracted

                        agent_history.append(
                            {"role": "model", "parts": [{"text": f"Llamando a {tool_call.name}"}]}
                        )
                        agent_history.append(
                            {
                                "role": "user",
                                "parts": [
                                    {
                                        "text": (
                                            f"System/ToolResult: {result_data}. "
                                            "Con los datos del catálogo obtenidos, "
                                            "analiza las respuestas del test y recomienda el perfume ideal."
                                        )
                                    }
                                ],
                            }
                        )
                    continue
                else:
                    return response.text()


async def get_recommendation(answers_summary: str) -> str:
    """
    Public entry point — retries up to 3 times on recoverable LLM errors.

    Args:
        answers_summary: Formatted string of user test answers.

    Returns:
        LLM-generated recommendation text.
    """
    return await run_with_retry(
        _do_fragrance_recommendation, answers_summary, retries=3, delay=6.0
    )
