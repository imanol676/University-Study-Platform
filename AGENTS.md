# AGENTS.md — University Study Platform

## Proyecto

Plataforma de aprendizaje para estudiantes universitarios basada en audio, active recall y RAG por materia.
La idea es que los estudiantes universitarios suban materiales como pdf, powerpoint, notas, audios e imagenes para que la IA genere sesiones de estudio personalizadas basadas en active recall y RAG por materia mediante preguntas y respuestas con TTS y STT. La app tendría como objetivo mantener al estudiante al día con sus asignaturas, reforzar su conocimiento y ayudarlo a preparar exámenes.

Stack principal:

* Next.js + TypeScript + TanStack Query + Prisma ORM + shadcn/ui + TailwindCSS
* Supabase: PostgreSQL, Auth y pgvector
* Cloudflare R2 para archivos y audio
* Azure AI para LLMs, embeddings, TTS y STT durante la etapa de validación

La aplicación se desarrolla como una PWA mobile-first y mantiene una arquitectura modular, simple y de bajo costo.

## Comandos

* Ejecutar: `npm run dev`
* Tests: `npm test`
* Lint: `npm run lint`
* Typecheck: `npm run typecheck`
* Build: `npm run build`

## Estilo y convenciones

* TypeScript como lenguaje principal.
* Código, nombres técnicos, variables, funciones, tipos y tablas en inglés.
* Documentación funcional y specs en español.
* `camelCase` para variables y funciones.
* `PascalCase` para componentes, tipos e interfaces.
* `snake_case` para PostgreSQL.
* Evitar `any`.
* Mantener la lógica de negocio fuera de componentes React y Route Handlers.
* Preferir soluciones simples y explícitas sobre abstracciones innecesarias.

## Reglas

* Lee `docs/constitution.md` y la spec activa antes de tocar código.
* Implementa únicamente el alcance definido por la spec activa.
* No añadas funcionalidades, infraestructura, dependencias o servicios externos que no estén especificados.
* No cambies decisiones arquitectónicas definidas en la constitution sin autorización.
* No modifiques el modelo de datos sin revisar `docs/data-model.md`.
* No cambies capacidades de IA sin revisar `docs/ai-spec.md`.
* Mantén las integraciones externas detrás de servicios o adapters.
* No expongas secretos ni credenciales en código cliente.

## Al terminar cualquier tarea

* Revisa los acceptance criteria de la spec activa.
* Ejecuta `npm run typecheck`.
* Ejecuta `npm run lint`.
* Ejecuta `npm test`.
* Ejecuta `npm run build` si la tarea afecta compilación, routing, configuración o dependencias.
* Corrige errores introducidos por tus cambios.
* Actualiza la documentación afectada si cambió el modelo de datos, arquitectura o comportamiento de IA.
* Resume qué implementaste, qué verificaciones ejecutaste y cualquier pendiente relevante.
