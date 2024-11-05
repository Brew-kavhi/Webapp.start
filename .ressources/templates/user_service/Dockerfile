FROM golang:1.23 AS build
WORKDIR /go/src
COPY main.go .
COPY login_handler.go .
COPY middleware.go .
COPY models.go .
COPY registration_handler.go .
COPY userDB.go .
COPY user_handler.go .
COPY utils.go .
COPY go.sum .
COPY go.mod .
COPY .env .

ENV CGO_ENABLED=1

RUN go build -o user_service .

EXPOSE 8080/tcp
ENTRYPOINT ["./user_service"]
