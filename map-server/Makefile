.PHONY: build
build:
	npm install

.PHONY: clean
clean:
	rm -rf node_modules
	rm -f npm-debug.log

.PHONY: run
run:
	MESSAGING_SERVICE_HOST=amqp.zone npm start
