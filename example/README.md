# cerbos-config

This is used to store the config files for our CERBOS instance and pulled from the Kubernetes CERBOS deployment

# Current Structure

## Principal

see [principal.json](_schemas/principal.json)

```typescript
{
  id: "string",
  role: "user" | "admin" | "role manager",
  attributes: {
    fleet: "string",
    department: "tech" | "legal",
    fleetGroups: {
      // group id as key
      us: {
        role: "owner" | "member"
      }
    }
    fleets: {
       // fleet id as key
      "4a26b50d-154e-4b8e-9e85-2f894c8291ac": {
        role: "owner" | "member" | "editor" // currently only "editor" is used
      }
    }
  }
}

```

# run tests locally

Run from this directory:

```bash
docker run -i -t -v .:/policies ghcr.io/cerbos/cerbos:0.29.0 compile /policies
```
