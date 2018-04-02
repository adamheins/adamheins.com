NODE=node

.PHONY: production development clean

production: clean
	@echo Production build.
	@$(NODE) ./blogger.js all production

development: clean
	@echo Development build.
	@$(NODE) ./blogger.js all development

clean:
	@rm -rf public
