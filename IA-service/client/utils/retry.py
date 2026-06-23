"""
Async retry helper with exponential back-off.

Extracted from agents/tools.py to keep that module focused on
Mirascope tool stubs only.
"""

import asyncio
from utils.logger import get_logger

log = get_logger(__name__)


def extract_exception(exc: BaseException) -> BaseException:
    """
    Unwrap ExceptionGroup (Python 3.11+) to get the root cause.
    Recurses until a non-group exception is found.
    """
    if isinstance(exc, BaseExceptionGroup):
        return extract_exception(exc.exceptions[0])
    return exc


async def run_with_retry(fn, *args, retries: int = 3, delay: float = 5.0, **kwargs):
    """
    Execute an async callable with automatic retry on recoverable errors.

    Recoverable signals: 503 / UNAVAILABLE / 429 / RESOURCE_EXHAUSTED / quota.
    If the provider returns a "Please retry in Xs" hint, that wait time is
    honoured up to 10 seconds; longer waits abort immediately to avoid
    blocking Gunicorn workers indefinitely.

    Args:
        fn:      The async function to call.
        *args:   Positional arguments forwarded to `fn`.
        retries: Maximum number of attempts (default 3).
        delay:   Base wait time between retries in seconds (default 5.0).
        **kwargs: Keyword arguments forwarded to `fn`.

    Returns:
        The return value of `fn` on success.

    Raises:
        The last exception if all retries are exhausted.
    """
    last_exc: BaseException | None = None

    for attempt in range(1, retries + 1):
        try:
            return await fn(*args, **kwargs)
        except Exception as exc:
            root = extract_exception(exc)
            err_str = str(root)
            last_exc = exc

            is_recoverable = (
                "503" in err_str
                or "UNAVAILABLE" in err_str
                or "high demand" in err_str
                or "429" in err_str
                or "RESOURCE_EXHAUSTED" in err_str
                or "quota" in err_str.lower()
            )

            if is_recoverable and attempt < retries:
                wait_time = delay

                if "Please retry in" in err_str:
                    import re
                    match = re.search(r"Please retry in ([\d\.]+)s", err_str)
                    if match:
                        wait_time = float(match.group(1))

                if wait_time > 10.0:
                    log.warning(
                        "Retry delay %.1fs is too long (attempt %d/%d). Aborting.",
                        wait_time, attempt, retries,
                    )
                    raise last_exc

                log.warning(
                    "Recoverable error (attempt %d/%d). Retrying in %.1fs: %s",
                    attempt, retries, wait_time, err_str[:120],
                )
                await asyncio.sleep(wait_time)
                continue

            raise last_exc
