<?php
/**
 * Manejador CRUD genérico reutilizado por cada endpoint de recurso.
 * Usa siempre sentencias preparadas y listas blancas de columnas
 * para evitar inyección SQL (nombres de tabla/columna nunca vienen del cliente).
 */

class CrudHandler
{
    private $conn;
    private $table;
    private $primaryKey;
    private $allowedColumns;
    private $idPrefix;
    private $hiddenColumns;

    public function __construct(
        PDO $conn,
        string $table,
        string $primaryKey,
        array $allowedColumns,
        string $idPrefix = 'id',
        array $hiddenColumns = []
    ) {
        $this->conn = $conn;
        $this->table = $table;
        $this->primaryKey = $primaryKey;
        $this->allowedColumns = $allowedColumns;
        $this->idPrefix = $idPrefix;
        $this->hiddenColumns = $hiddenColumns;
    }

    public function handle(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = $_GET['id'] ?? null;

        switch ($method) {
            case 'GET':
                $id ? $this->getOne($id) : $this->getAll();
                break;
            case 'POST':
                $this->create();
                break;
            case 'PUT':
            case 'PATCH':
                $this->update($id);
                break;
            case 'DELETE':
                $this->delete($id);
                break;
            default:
                Response::error('Método no permitido', 405);
        }
    }

    private function getAll(): void
    {
        $limit = isset($_GET['limit']) ? min((int) $_GET['limit'], 200) : 100;
        $offset = isset($_GET['offset']) ? max((int) $_GET['offset'], 0) : 0;

        $stmt = $this->conn->prepare(
            "SELECT * FROM `{$this->table}` ORDER BY `{$this->primaryKey}` DESC LIMIT :limit OFFSET :offset"
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        Response::success(array_map([$this, 'stripHidden'], $stmt->fetchAll()));
    }

    private function getOne(string $id): void
    {
        $stmt = $this->conn->prepare(
            "SELECT * FROM `{$this->table}` WHERE `{$this->primaryKey}` = :id LIMIT 1"
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        $row ? Response::success($this->stripHidden($row)) : Response::error('Registro no encontrado', 404);
    }

    private function stripHidden(array $row): array
    {
        foreach ($this->hiddenColumns as $column) {
            unset($row[$column]);
        }
        return $row;
    }

    private function create(): void
    {
        $body = Response::getJsonBody();
        $fields = $this->filterAllowed($body);

        if (empty($fields)) {
            Response::error('No se enviaron campos válidos', 422);
        }

        if (!isset($fields[$this->primaryKey]) || $fields[$this->primaryKey] === '') {
            $fields[$this->primaryKey] = $this->generateId();
        }

        $columns = array_keys($fields);
        $placeholders = array_map(fn($c) => ':' . $c, $columns);

        $sql = sprintf(
            'INSERT INTO `%s` (`%s`) VALUES (%s)',
            $this->table,
            implode('`, `', $columns),
            implode(', ', $placeholders)
        );

        $stmt = $this->conn->prepare($sql);
        foreach ($fields as $col => $val) {
            $stmt->bindValue(':' . $col, $val);
        }

        try {
            $stmt->execute();
        } catch (PDOException $e) {
            Response::error('No se pudo crear el registro (posible duplicado o dato inválido)', 409);
        }

        $this->getOne($fields[$this->primaryKey]);
    }

    private function update(?string $id): void
    {
        if (!$id) {
            Response::error('Falta el parámetro id', 400);
        }

        $body = Response::getJsonBody();
        $fields = $this->filterAllowed($body);
        unset($fields[$this->primaryKey]);

        if (empty($fields)) {
            Response::error('No se enviaron campos válidos para actualizar', 422);
        }

        $setClause = implode(', ', array_map(fn($c) => "`{$c}` = :{$c}", array_keys($fields)));
        $sql = "UPDATE `{$this->table}` SET {$setClause} WHERE `{$this->primaryKey}` = :__id";

        $stmt = $this->conn->prepare($sql);
        foreach ($fields as $col => $val) {
            $stmt->bindValue(':' . $col, $val);
        }
        $stmt->bindValue(':__id', $id);

        try {
            $stmt->execute();
        } catch (PDOException $e) {
            Response::error('No se pudo actualizar el registro', 409);
        }

        $this->getOne($id);
    }

    private function delete(?string $id): void
    {
        if (!$id) {
            Response::error('Falta el parámetro id', 400);
        }

        $stmt = $this->conn->prepare("DELETE FROM `{$this->table}` WHERE `{$this->primaryKey}` = :id");
        $stmt->execute([':id' => $id]);

        $stmt->rowCount() > 0
            ? Response::success(['deleted' => $id])
            : Response::error('Registro no encontrado', 404);
    }

    private function filterAllowed(array $body): array
    {
        return array_intersect_key($body, array_flip($this->allowedColumns));
    }

    private function generateId(): string
    {
        return $this->idPrefix . '-' . bin2hex(random_bytes(4));
    }
}
