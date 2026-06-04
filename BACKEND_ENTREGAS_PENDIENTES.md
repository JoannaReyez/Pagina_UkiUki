# Entregas Pendientes

Este proyecto Angular ya consume estos endpoints:

- `GET ?getPendientesEmpleado={employeeId}`
- `POST ?aceptarEntrega` con `{ "entregaId": 1 }`
- `POST ?rechazarEntrega` con `{ "entregaId": 1 }`
- `POST ?supplyEmpleado` ahora debe crear una entrega pendiente, no sumar inventario al empleado.

## SQL

```sql
CREATE TABLE IF NOT EXISTS entregas_pendientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  empleado_id INT NOT NULL,
  cantidad INT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
  fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta DATETIME NULL,
  INDEX idx_entregas_empleado_estado (empleado_id, estado),
  INDEX idx_entregas_producto (producto_id)
);
```

## supplyEmpleado

Debe validar stock del administrador en `productos`, descontarlo y crear `entregas_pendientes`.

No debe hacer `INSERT` ni `UPDATE` en `empleado_inventario`.

Respuesta sugerida:

```json
{
  "pendingId": 12,
  "productId": 3,
  "employeeId": 5,
  "quantity": 10,
  "adminStockBefore": 100,
  "adminStockAfter": 90,
  "updatedProduct": {
    "id": 3,
    "stock": 90,
    "status": "Activo"
  }
}
```

## getPendientesEmpleado

Debe regresar solo entregas con `estado = 'Pendiente'`.

Campos esperados por Angular:

```json
[
  {
    "id": 12,
    "productId": 3,
    "employeeId": 5,
    "quantity": 10,
    "status": "Pendiente",
    "sentAt": "2026-06-03",
    "productName": "Cheetos",
    "image": "/products/mochi-box.svg",
    "category": "Botanas"
  }
]
```

## aceptarEntrega

Debe ejecutarse dentro de transaccion:

1. Buscar la entrega pendiente por `id` y bloquearla.
2. Cambiar `estado` a `Aceptada` y llenar `fecha_respuesta`.
3. Sumar `cantidad` en `empleado_inventario` con `INSERT ... ON DUPLICATE KEY UPDATE`.
4. Registrar movimiento con tipo `Entrada Aceptada`.
5. Responder `code: 200`.

## rechazarEntrega

Debe ejecutarse dentro de transaccion:

1. Buscar la entrega pendiente por `id` y bloquearla.
2. Cambiar `estado` a `Rechazada` y llenar `fecha_respuesta`.
3. Regresar `cantidad` al stock de `productos`.
4. Registrar movimiento con tipo `Entrada Rechazada`.
5. Responder `code: 200`.

## Rutas.php

Agregar estos casos al `switch`:

```php
case 'getPendientesEmpleado':
    $id = (int) ($paramsGet['getPendientesEmpleado'] ?? 0);
    if (!$id) {
        echo json_encode(['code' => 400, 'data' => ['message' => 'ID de empleado requerido.']]);
        break;
    }
    $connect->getPendientesEmpleado($id);
    echo json_encode(['code' => $connect->getCode(), 'data' => $connect->getData()]);
    break;

case 'aceptarEntrega':
    if (!$helper->validParams($paramsPost, ['entregaId'])) {
        echo json_encode(['code' => 400, 'data' => ['message' => 'entregaId es requerido.']]);
        break;
    }
    $connect->aceptarEntrega((int) $paramsPost['entregaId']);
    echo json_encode(['code' => $connect->getCode(), 'data' => $connect->getData()]);
    break;

case 'rechazarEntrega':
    if (!$helper->validParams($paramsPost, ['entregaId'])) {
        echo json_encode(['code' => 400, 'data' => ['message' => 'entregaId es requerido.']]);
        break;
    }
    $connect->rechazarEntrega((int) $paramsPost['entregaId']);
    echo json_encode(['code' => $connect->getCode(), 'data' => $connect->getData()]);
    break;
```

