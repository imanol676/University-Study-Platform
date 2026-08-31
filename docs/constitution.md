# Constitution — University Study Platform

## 1. Propósito

Este documento define los principios técnicos, de seguridad, arquitectura, experiencia de usuario y calidad que gobiernan el desarrollo de University Study Platform.

Todas las features, specs, decisiones arquitectónicas e implementaciones deben respetar esta constitution.

Si una spec contradice alguno de estos principios, la contradicción debe resolverse explícitamente antes de implementar.

---

## 2. Principios del producto

University Study Platform es una herramienta profesional de aprendizaje para estudiantes universitarios.

Su objetivo es ayudar al estudiante a:

* comprender contenido académico;
* mantener sus materias al día;
* practicar active recall;
* detectar debilidades de conocimiento;
* prepararse para evaluaciones;
* construir conocimiento útil para su futura vida profesional.

La aplicación no debe posicionarse ni diseñarse como un juego.

El audio, la IA, el RAG y otras tecnologías son medios para mejorar el aprendizaje, no el producto en sí mismos.

La unidad principal del producto es la **materia**.

Cada materia mantiene su propio contexto académico, documentos, conceptos, progreso, sesiones y estimaciones de dominio.

---

# 3. Seguridad — principio no negociable

La seguridad de los usuarios, sus datos y las credenciales del sistema tiene prioridad sobre velocidad de desarrollo, comodidad o simplicidad de implementación.

## 3.1 Credenciales

Nunca deben exponerse al cliente:

* API keys;
* service-role keys;
* secretos de Azure;
* credenciales de Supabase privilegiadas;
* secretos de R2;
* tokens internos;
* claves privadas;
* secretos de proveedores externos.

Las operaciones que requieran secretos deben ejecutarse exclusivamente en infraestructura server-side.

Nunca se deben:

* hardcodear secretos;
* subir secretos al repositorio;
* incluir secretos reales en tests;
* almacenar secretos en código fuente;
* imprimir secretos en logs.

Los secretos deben almacenarse mediante variables de entorno o servicios seguros de gestión de secretos.

---

## 3.2 Hashing y cifrado

Las contraseñas nunca deben almacenarse en texto plano.

Si la aplicación en algún momento gestiona contraseñas directamente, deben utilizarse algoritmos modernos diseñados para password hashing como:

* Argon2id;
* bcrypt;
* scrypt.

No utilizar hashes genéricos como SHA-256 directamente para almacenar contraseñas.

La aplicación utiliza preferentemente Supabase Auth para evitar gestionar credenciales directamente.

Los datos sensibles que deban recuperarse posteriormente no deben hashearse. Deben protegerse mediante cifrado adecuado y acceso restringido.

La regla es:

```text
Password
→ hash irreversible

Secret recuperable
→ cifrado / secret manager

API key del sistema
→ environment / secret manager

Token temporal
→ mínimo privilegio + expiración
```

---

## 3.3 Autorización

Toda operación protegida debe verificar la identidad del usuario en el servidor.

Nunca confiar únicamente en:

```text
userId
courseId
documentId
```

recibidos desde el cliente como prueba de autorización.

La aplicación debe comprobar que el recurso solicitado pertenece al usuario autenticado.

Supabase Row Level Security debe utilizarse como capa adicional de protección para datos pertenecientes al usuario.

---

## 3.4 Datos académicos

Se deben considerar privados:

* documentos;
* PDFs;
* apuntes;
* respuestas;
* grabaciones;
* progreso;
* resultados;
* materias;
* historial de estudio.

Los logs no deben almacenar innecesariamente contenido completo enviado por los estudiantes.

Aplicar siempre el principio de:

> almacenar únicamente aquello que necesitamos.

---

# 4. Arquitectura

El MVP utilizará una arquitectura de **monolito modular**.

No introducir microservicios hasta que exista una necesidad técnica demostrable.

Arquitectura inicial:

```text
Next.js PWA
      │
      ├── Client
      │
      ├── Server
      │
      ├── Application Services
      │
      └── Domain Logic
               │
       ┌───────┼─────────┐
       │       │         │
   Supabase   R2      Azure AI
```

Tecnologías principales:

* Next.js;
* Prisma ORM;
* React;
* TypeScript;
* TanStack Query;
* Tailwind CSS;
* shadcn/ui;
* Supabase Auth;
* PostgreSQL;
* pgvector;
* Cloudflare R2;
* Azure AI.

---

# 5. Separación cliente-servidor

La separación entre código cliente y servidor debe ser explícita.

El cliente es responsable principalmente de:

* presentación;
* interacción;
* estado visual;
* formularios;
* navegación;
* consumo de APIs;
* cache cliente mediante TanStack Query.

El servidor es responsable de:

* autenticación;
* autorización;
* acceso privilegiado a datos;
* lógica de negocio;
* RAG;
* llamadas a modelos de IA;
* uso de credenciales;
* generación de URLs firmadas;
* cálculo de dominio;
* tracking de costos.

Nunca ejecutar lógica sensible en componentes cliente.

---

# 6. Diseño para mantenibilidad

El código debe priorizar:

1. claridad;
2. mantenibilidad;
3. testabilidad;
4. escalabilidad;
5. simplicidad.

No optimizar por cantidad mínima de archivos.

Separar responsabilidades cuando exista una frontera clara de dominio.

Ejemplo conceptual:

```text
src/
├── app/
├── components/
├── features/
├── services/
│   ├── courses/
│   ├── documents/
│   ├── study/
│   ├── mastery/
│   ├── rag/
│   └── ai/
├── repositories/
├── lib/
└── types/
```

La estructura exacta puede evolucionar, pero las responsabilidades deben mantenerse separadas.

---

# 7. Componentes reutilizables

Las interfaces deben construirse mediante componentes reutilizables cuando exista comportamiento o presentación repetida.

Por ejemplo:

```text
CourseCard
ProgressIndicator
StudySessionCard
AudioPlayer
ActiveRecallQuestion
DocumentItem
StatusBadge
PageHeader
EmptyState
ErrorState
```

No abstraer componentes únicamente porque dos elementos sean visualmente similares una vez.

Crear abstracciones cuando exista reutilización o responsabilidad clara.

Evitar componentes gigantes que concentren:

* fetching;
* lógica de negocio;
* transformación de datos;
* rendering;
* mutations;
* modales;
* validaciones;

en un único archivo.

---

# 8. Manejo de datos en frontend

TanStack Query será la herramienta principal para manejar **server state** en el cliente.

Debe utilizarse para:

* queries;
* mutations;
* cache;
* invalidación;
* loading states;
* retries controlados;
* actualización de datos remotos.

Ejemplo:

```text
Component
   ↓
useCourse()
   ↓
TanStack Query
   ↓
API
   ↓
Application Service
   ↓
Repository
```

No duplicar innecesariamente server state utilizando:

* `useEffect`;
* Context;
* Zustand;
* estados locales.

El estado local debe utilizarse para estado genuinamente perteneciente a la interfaz.

---

# 9. Manejo de errores

Los errores deben tratarse explícitamente.

Una operación susceptible a errores externos debe tener una estrategia definida.

Ejemplos:

* database failure;
* Azure failure;
* upload failure;
* invalid document;
* authentication failure;
* rate limit;
* malformed AI output.

Utilizar `try/catch` cuando el código pueda:

* transformar el error;
* registrar contexto útil;
* realizar cleanup;
* aplicar fallback;
* devolver una respuesta apropiada.

No utilizar `try/catch` indiscriminadamente si simplemente se va a ignorar o volver a lanzar el mismo error sin aportar contexto.

Los errores deben propagarse de manera controlada:

```text
Infrastructure error
       ↓
Application error
       ↓
API response
       ↓
TanStack Query
       ↓
User-facing state
```

Nunca mostrar al usuario:

* stack traces;
* SQL;
* prompts internos;
* errores del proveedor;
* secretos;
* información sensible.

La interfaz debe tener estados claros de:

* loading;
* empty;
* success;
* recoverable error;
* fatal error.

---

# 10. Inteligencia Artificial

La IA debe mantenerse desacoplada del resto del producto.

Definir providers para capacidades como:

```text
LLMProvider
EmbeddingProvider
TTSProvider
STTProvider
```

Azure será el proveedor principal durante la etapa de validación, pero la lógica del dominio no debe depender directamente del SDK de Azure.

No distribuir llamadas directas a proveedores por toda la aplicación.

---

# 11. RAG

Cada materia funciona como un contexto independiente.

La información recuperada debe estar aislada por `course_id`.

Pipeline conceptual:

```text
Document
   ↓
Parse
   ↓
Chunk
   ↓
Embedding
   ↓
pgvector
```

Consulta:

```text
Question
   ↓
Embedding
   ↓
Vector search
   ↓
Filter course_id
   ↓
Relevant context
   ↓
LLM
```

Nunca enviar todos los documentos de una materia al LLM cuando puedan recuperarse únicamente los fragmentos relevantes.

---

# 12. Eficiencia y costos de IA

El proyecto debe poder validarse utilizando infraestructura de bajo costo.

La infraestructura debe crecer detrás de la demanda y los ingresos, no delante.

Principios:

* pay-per-use;
* serverless cuando sea razonable;
* evitar servicios permanentes innecesarios;
* evitar GPUs dedicadas;
* evitar vector databases adicionales;
* evitar workers permanentes hasta necesitarlos.

Las generaciones costosas deben cachearse cuando sea posible.

Los embeddings no deben regenerarse si el contenido no cambió.

El audio no debe generarse automáticamente al subir contenido.

Debe generarse cuando exista intención real de escucharlo.

---

# 13. Escalabilidad

El MVP debe ser simple sin cerrarnos caminos de crecimiento.

Escalabilidad no significa construir infraestructura compleja anticipadamente.

Significa:

* módulos desacoplados;
* responsabilidades claras;
* consultas eficientes;
* buenas relaciones de datos;
* providers intercambiables;
* servicios testeables;
* stateless backend cuando sea posible;
* almacenamiento adecuado;
* límites claros entre dominio e infraestructura.

No introducir arquitectura distribuida por una necesidad hipotética futura.

---

# 14. Calidad del código

Se requiere:

* TypeScript estricto;
* evitar `any`;
* inputs validados;
* outputs de IA validados;
* funciones pequeñas;
* nombres descriptivos;
* errores explícitos;
* eliminación de código muerto;
* ausencia de secretos;
* ausencia de debugging accidental.

Los outputs estructurados generados por modelos deben validarse antes de utilizarse.

Un modelo devolviendo JSON válido sintácticamente no implica que los datos sean válidos.

---

# 15. Base de datos

PostgreSQL será la fuente principal de verdad.

pgvector será utilizado para embeddings.

Los cambios de esquema deben realizarse mediante migraciones versionadas.

No realizar cambios manuales en producción como reemplazo de migraciones.

Los datos binarios grandes no deben almacenarse directamente en PostgreSQL.

Utilizar object storage para:

* PDFs;
* audio;
* archivos grandes.

PostgreSQL almacena:

* metadata;
* relaciones;
* estados;
* referencias.

---

# 16. Experiencia de usuario

University Study Platform debe transmitir:

> conocimiento, concentración, claridad y progreso.

La interfaz debe sentirse como una herramienta profesional de productividad y aprendizaje.

Referencias conceptuales de tono:

* Notion;
* Obsidian;
* Linear;
* herramientas modernas de productividad.

No significa copiar visualmente estos productos.

Significa compartir principios como:

* jerarquía clara;
* baja distracción;
* información bien estructurada;
* interfaces sobrias;
* acciones predecibles;
* densidad de información útil.

---

# 17. Tono visual

Evitar estética:

* infantil;
* excesivamente colorida;
* caricaturesca;
* lúdica;
* basada en recompensas artificiales.

No utilizar:

* mascotas;
* monedas;
* cofres;
* vidas;
* XP arbitrario;
* celebraciones excesivas;
* confetti recurrente.

Los emojis deben evitarse en elementos principales de la interfaz cuando reduzcan el tono profesional.

Preferir iconografía consistente mediante una biblioteca de iconos.

Ejemplo:

Preferir:

```text
[icon] Iniciar sesión
[icon] Revisión recomendada
[icon] Escuchar
```

sobre:

```text
🎧 ¡A estudiar!
🔥 10 días!
🎉 Excelente!
```

Un emoji puede utilizarse excepcionalmente cuando tenga sentido comunicativo claro, pero nunca debe sustituir la iconografía principal del producto.

---

# 18. Lenguaje de la interfaz

El tono debe ser:

* profesional;
* cercano;
* claro;
* conciso;
* respetuoso;
* adulto.

Evitar lenguaje condescendiente o excesivamente motivacional.

Ejemplo recomendado:

> Revisión recomendada
> Repasá OSPF durante aproximadamente 8 minutos.

Evitar:

> ¡Vamos campeón! 🔥
> ¡No pierdas tu racha!

---

# 19. Progreso y motivación

El producto puede utilizar mecanismos como:

* continuidad;
* progreso;
* objetivos;
* recomendaciones;
* preparación estimada.

Pero deben estar vinculados a resultados reales de aprendizaje.

Preferir:

> 12 días de continuidad

sobre:

> 🔥 12 day streak

Preferir:

> Dominio estimado: 74%

sobre:

> Nivel 7

Preferir:

> 3 temas requieren revisión

sobre:

> Te quedan tres misiones.

---

# 20. Dominio estimado

La aplicación nunca debe afirmar con certeza absoluta cuánto conocimiento posee una persona.

Utilizar términos como:

* dominio estimado;
* nivel de preparación;
* rendimiento observado;
* revisión recomendada.

El score se basa únicamente en las evidencias disponibles dentro de la plataforma.

---

# 21. Contextos profesionales sensibles

La plataforma puede utilizar escenarios profesionales como herramienta educativa.

Sin embargo, no debe presentar contenido generado como asesoramiento profesional real.

Esto es especialmente importante en:

* medicina;
* psicología;
* derecho;
* ingeniería crítica;
* finanzas;
* otras profesiones reguladas.

Un escenario médico generado para practicar es:

> entrenamiento académico.

No:

> una recomendación clínica.

---

# 22. Testing

La lógica importante debe ser testeable independientemente de servicios externos.

Priorizar tests para:

* mastery;
* active recall evaluation;
* chunking;
* retrieval;
* scheduling;
* permisos;
* límites de uso;
* transformaciones de datos.

Las suites automáticas no deben consumir APIs de IA pagas.

Los providers externos deben poder mockearse.

Cuando se corrige un bug importante, añadir un test de regresión cuando sea razonable.

---

# 23. Observabilidad

Los errores importantes deben registrarse con suficiente contexto técnico para poder diagnosticarlos.

Nunca incluir secretos ni contenido privado completo innecesariamente.

Las operaciones de IA deben poder medirse en términos de:

* provider;
* model;
* input tokens;
* output tokens;
* duración;
* caracteres TTS;
* tiempo STT;
* costo estimado.

El costo por usuario debe poder observarse desde etapas tempranas.

---

# 24. YAGNI

No construir algo porque “podría necesitarse después”.

Construirlo cuando:

* exista un requisito;
* exista evidencia;
* exista un problema medido.

Antes de añadir:

* servicio;
* biblioteca;
* abstracción;
* microservicio;
* cache;
* cola;
* base de datos;

preguntar:

> ¿Qué problema actual resuelve?

Si no existe una respuesta concreta, probablemente no corresponda implementarlo todavía.

---

# 25. Definición de calidad

Una feature no está terminada solamente porque funciona visualmente.

Debe además:

* cumplir su spec;
* respetar esta constitution;
* proteger datos;
* manejar errores;
* estar correctamente tipada;
* ser mantenible;
* no introducir costos innecesarios;
* funcionar correctamente en mobile;
* tener estados de interfaz apropiados;
* incluir tests cuando corresponda.

---

## Regla final

Ante dos soluciones que cumplen correctamente los requisitos, preferir:

> **la más simple, segura, mantenible y económica.**

No sacrificar seguridad.

No introducir complejidad sin evidencia.

No optimizar únicamente para terminar más rápido si eso genera deuda estructural evidente.
