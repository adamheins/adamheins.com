NODE=node

.PHONY: production development clean

production: clean
	@echo Production build.
	@$(NODE) ./blogger.js p

development: clean
	@echo Development build.
	@$(NODE) ./blogger.js d

clean:
	@rm -rf public
