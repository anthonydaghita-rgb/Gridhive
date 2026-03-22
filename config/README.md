# Gridhive Live Config Directory

Drop JSON files here (or upload via `/admin/upload`) to update the running app **without restarting**.

## Subdirectories

### `templates/`
Add or update topology templates. Files must match the template upload schema:
```json
{
  "type": "template",
  "slug": "my-template",
  "name": "My Template",
  "description": "Optional description",
  "category": "custom",
  "difficulty": "beginner",
  "tags": ["tag1"],
  "topology": { "nodes": [], "edges": [], "viewport": { "x": 0, "y": 0, "zoom": 1 } },
  "simTestSuite": []
}
```

### `validation/`
Enable/disable or re-weight validation rules:
```json
{
  "type": "validation-config",
  "rules": {
    "IP_CONFLICT": { "enabled": true, "severity": "error" },
    "NO_DHCP_SERVER": { "enabled": false }
  }
}
```

### `sim-suites/`
Add simulation test suites to existing templates:
```json
{
  "type": "sim-suite",
  "templateSlug": "star-office",
  "tests": [
    {
      "id": "custom-test-1",
      "name": "Custom reachability test",
      "type": "reachability",
      "sourceId": "node-1",
      "targetId": "node-2",
      "expectedResult": "reachable"
    }
  ]
}
```

## Upload via API
```bash
curl -X POST http://localhost:3001/admin/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@my-template.json"
```
