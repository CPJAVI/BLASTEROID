# 🔫 BLASTEROID

**BLASTEROID** es un juego de acción y plataformas desarrollado con HTML, CSS y JavaScript puro. Controla a un héroe que debe eliminar a todos los enemigos en 5 niveles cada vez más desafiantes, mientras recolecta gemas y esquiva peligros. ¡Enfréntate al jefe final y demuestra tu habilidad!

---

## 🎮 Características

- **5 niveles** con temáticas y enemigos únicos.
- **Jefe final** en el nivel 5 con IA avanzada.
- **Sistema de vidas** (10 puntos de salud).
- **Recolección de gemas** que aparecen aleatoriamente.
- **Enemigos variados**: terrestres, libélulas, tiburones y un jefe.
- **Físicas realistas** (gravedad, salto, colisiones).
- **Efectos de sonido** y música de fondo.
- **Controles intuitivos** y experiencia fluida.

---

## 🕹️ Controles

| Tecla              | Acción                     |
|--------------------|----------------------------|
| `←` / `→`          | Moverse lateralmente        |
| `↑`                | Saltar                     |
| `Espacio`          | Disparar                   |
| `↑` / `↓` / `←` / `→` | Nadar (cuando estás en el agua) |

---

## 📂 Estructura del proyecto

BLASTEROID/
├── index.html # Página principal
├── style.css # Estilos y diseño
├── config.js # Configuración global (canvas, imágenes, variables)
├── sound.js # Clase para gestión de sonidos
├── entities.js # Clases: Player, Bullet, Enemy, etc.
├── levels.js # Definición de los 5 niveles
├── main.js # Lógica principal del juego (bucle, eventos)
├── images/ # Carpeta con los sprites
│ ├── personaje.png
│ ├── enemigo.png
│ ├── jefe.png
│ ├── tiburon.png
│ └── libelula.png
└── audio/ # Carpeta con los efectos de sonido
├── music.mp3
├── shot.m4a
├── jump.mp3
├── victory.m4a
└── defeat.m4a

---

## 🚀 Instalación y ejecución

### Requisitos previos

- **Node.js** (para usar `http-server` o cualquier servidor estático).

### Pasos

1. Clona este repositorio o descarga los archivos.
2. Abre una terminal en la carpeta del proyecto.
3. Instala `http-server` globalmente (opcional):
   ```bash
   npm install -g http-server

4. Inicia el servidor en el puerto que prefieras (ejemplo: 3008): http-server -p 3008
5. Abre tu navegador y visita: http://localhost:3008

