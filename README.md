# BoidSimulation
[simulation](https://osmaredev.github.io/BoidSimulation/) of Boids and flock behavior using p5.js library
![a1](https://github.com/OsmareDev/BoidSimulation/assets/50903643/432d9302-6be6-4c91-8c8e-2b572ebb35d8)

### English

A simulation of boids and flocks refers to the computational representation of a model that simulates the collective behavior of individual entities called "boids" that are grouped into sets known as "flocks" and serves to create interaction between individuals of said groups among other things.

Normally these groups follow a series of rules based on:

1. Separation: Avoiding collisions with other nearby boids

2. Alignment: Tending to follow the direction and speed of neighboring boids

3. Cohesion: Trying not to separate too much from the group, tending a little towards the center of said group

4. Search and flee: They may have as a priority going to a specific place or fleeing from something.

By mixing all these rules, a more natural behavior of individuals is achieved. Additionally, extra components are added to this test:

1. Formation: Each individual is given a position to form a word, each new individual will occupy a point in said word until there are others, in which case they will move through space. Each individual changes position with the neighbor and must follow the previous rules, which creates constant movement.

2. Electricity: The option to charge one of the particles with electricity has been added to the program, which according to the imposed regulations will charge another, each one firing in the opposite direction to said discharge. The number of discharges per particle and the choice of these can be chosen by the user.

### Español

Una simulación de boids y flocks se refiere a la representación computacional de un modelo que simula el comportamiento colectivo de entidades individuales llamadas "boids" que se agrupan en conjuntos conocidos como "flocks" y sirve para crear interacción entre individuos de dichos grupos entre otras cosas.

Normalmente dichos grupos siguen de base una serie de normas:

1. Separación: Evitando colisiones con otros boids cercanos

2. Alineación: Tendiendo a seguir la dirección y velocidad de boids vecinos

3. Cohesión: Tratando de no separarse demasiado del grupo tendiendo un poco hacia el centro de dicha agrupación

4. Buscar y huir: Pueden tener como prioridad el ir a un sitio concreto o huir de algo.

Mezclando todas estas normas se consigue un comportamiento más natural de los individuos. Además en esta prueba se agregan componentes extras:

1. Formación: A cada individuo se le da una posición para formar una palabra, cada nuevo individuo ocupará un punto en dicha palabra hasta que sobren, en cuyo caso se moverán por el espacio. Cada individuo cambia de posición con la vecina y deberán seguir las normas anteriores por lo que crea un constante movimiento.

2. Electricidad: Al programa se le ha añadido la opción de cargar de electricidad a una de las partículas lo cual según las normas impuestas cargará a otra disparando cada una en la dirección opuesta a dicha descarga. El número de descargas por partícula y la elección de estas pueden ser elegidas por el usuario.
