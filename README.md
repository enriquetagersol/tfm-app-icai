# tfm-teleco-ICAI-2024
En este repositorio se incluye el código de una aplicación web desarrollada como Trabajo Fin de Máster (TFM).

Se trata de una aplicación web para la gestión de comunidades de vecinos. El proyecto se lleva a cabo empleando los lenguajes tradicionales de programación web 
así como los servicios proporcionados por AWS a fin de conseguir que la aplicación sea serverless

Se crean dos plataformas: 
* Plataforma superusuarios
* Plataforma usuarios (vecinos y administradores)

Para cada una de ellas se crea en AWS S3 un bucket:
* tfm-app-icai-admins (para la plataforma de superadministradores)
* tfm-app-icai (para la plataforma de usuarios)

En este repositorio se crean dos carpetas que se corresponden con dichos buckets

En este repositorio también se crea una carpeta llamada "Lambda" donde se almacenan los códigos de las funciones Lambda 
