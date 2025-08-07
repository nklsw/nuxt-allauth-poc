bootstrap-api:
    (cd ./backend && uv sync && uv run manage.py migrate)

bootstrap-web:
    (cd ./frontend && pnpm install)

run-api:
    (cd ./backend && uv run manage.py runserver localhost:8000)


run-web:
    (cd ./frontend && pnpm run dev)

    
[parallel]
bootstrap: bootstrap-api bootstrap-web

[parallel]
run: run-api run-web

