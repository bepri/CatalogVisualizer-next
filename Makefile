.PHONY: start build clean scrape

start:
	test -d node_modules || pnpm install
	pnpm dev

build:
	npm install
	npm run build

scrape:
	python3 scraper/catalogscraper.py

update:
	test -d .venv || python3 -m venv .venv
	python3 -m pip install -U -r requirements.txt
	python3 -m pip freeze > requirements.txt
	npm update

clean:
	rm -rf dist