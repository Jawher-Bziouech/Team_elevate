FROM eclipse-temurin:17
EXPOSE 8080
ADD target/config-server-0.0.1-SNAPSHOT.jar config-server.jar

ENTRYPOINT ["java", "-jar","config-server.jar"]