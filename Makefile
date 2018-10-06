BIN=$(shell pwd)/node_modules/.bin

compile: clean
	@echo "  >  Compiling..."
	@$(BIN)/tsc

watch: compile
	@echo "  >  Watching for changes..."
	@yolo -i src -c "make compile"

run-example-app:
	@cd example-app && $(BIN)/budo index.js

clean:
	@echo "  >  Cleaning..."
	@rm -rf ./dist
