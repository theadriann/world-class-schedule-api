# WorldClass Schedule API
<p>Server app querying WorldClass API for classes<p>

## Endpoints

`GET/all`

```
REQUEST:

[] date_start : String(format: "YYYY-MM-DD")
[] date_end : String(format: "YYYY-MM-DD")


RESPONSE:

Object {
    clubs: <Club>[]
    schedules: <Schedule>[]
}
```

## Todo

- Cache responses
