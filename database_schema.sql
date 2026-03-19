-- SQL Script for Eluxar E-commerce (PostgreSQL)
-- Generated from Backend Entities

-- 1. AUTH & USERS
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    intentos_fallidos INT NOT NULL DEFAULT 0,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol_id INT NOT NULL REFERENCES roles(id)
);

-- 2. CATALOG
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    logo_url VARCHAR(255),
    activa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS familias_olfativas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    destacado BOOLEAN NOT NULL DEFAULT FALSE,
    marca_id INT REFERENCES marcas(id),
    categoria_id INT REFERENCES categorias(id),
    familia_olfativa_id INT REFERENCES familias_olfativas(id)
);

CREATE TABLE IF NOT EXISTS producto_variantes (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    tamano_ml INT NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    activa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS producto_imagenes (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    orden INT
);

CREATE TABLE IF NOT EXISTS producto_precios (
    id SERIAL PRIMARY KEY,
    variante_id INT NOT NULL REFERENCES producto_variantes(id) ON DELETE CASCADE,
    precio_costo DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    precio_oferta DECIMAL(10,2),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. INVENTORY
CREATE TABLE IF NOT EXISTS inventario (
    id SERIAL PRIMARY KEY,
    variante_id INT NOT NULL UNIQUE REFERENCES producto_variantes(id) ON DELETE CASCADE,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_reservado INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5
);

CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id SERIAL PRIMARY KEY,
    inventario_id INT NOT NULL REFERENCES inventario(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL, -- ENTRADA, SALIDA, AJUSTE, RESERVA, LIBERACION
    cantidad INT NOT NULL,
    motivo TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. SALES (CARTS & ORDERS)
CREATE TABLE IF NOT EXISTS carritos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carrito_items (
    id SERIAL PRIMARY KEY,
    carrito_id INT NOT NULL REFERENCES carritos(id) ON DELETE CASCADE,
    variante_id INT NOT NULL REFERENCES producto_variantes(id),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, CONFIRMADO, EN_PROCESO, ENVIADO, ENTREGADO, CANCELADO
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
    costo_envio DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    variante_id INT NOT NULL REFERENCES producto_variantes(id),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- SEED DATA (INITIAL DATA)
INSERT INTO roles (nombre) VALUES ('ADMIN'), ('USUARIO') ON CONFLICT (nombre) DO NOTHING;

-- INSERT INITIAL ADMIN USER (Example with bcrypt for 'admin123')
-- Password Hash: $2a$10$8.UnVuG9HHgffUDAlk8q6uy5QLKG6.z.99f7.6cE.nI1YpP.mD77y
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id) 
SELECT 'Admin', 'Eluxar', 'admin@eluxar.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5QLKG6.z.99f7.6cE.nI1YpP.mD77y', id 
FROM roles WHERE nombre = 'ADMIN'
ON CONFLICT (email) DO NOTHING;

-- INITIAL CATALOG DATA
INSERT INTO categorias (nombre) VALUES ('Masculino'), ('Femenino'), ('Unisex') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO marcas (nombre) VALUES ('Eluxar Signature'), ('Niche Collection') ON CONFLICT (nombre) DO NOTHING;
