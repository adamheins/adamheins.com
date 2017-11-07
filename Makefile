NODE=node

.PHONY: production development clean

production: clean
	@$(NODE) ./blogger.js p

development: clean
	@$(NODE) ./blogger.js d

clean:
	@rm -rf public
