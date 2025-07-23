
# Selenium Test Automation

## Running the Tests

### Local (with browser UI)

**Before running, install dependencies:**

>optional - creat python environment (example with conda) : 
```
conda create -n selenium_tests python=3.11 -y            
```
```
conda activate selenium_tests  
```
---------------

```bash
pip install -r requirements.txt
```

Run:

```bash
cd selenium
pytest test.py
````

> ⚠️ Edit `executable_path` in the script to match your OS:
>
> * macOS: `localServices/chromedriver-mac-x64/chromedriver`
> * Windows: `localServices/chromedriver-win64/chromedriver.exe`

Verbose - axtra prints

```bash
cd selenium
pytest -v test.py

```
### Headless (for CI / GitHub Actions) - no browser usage.

Run:

```bash
cd selenium
pytest -v testHeadless.py
```

> No need to set the ChromeDriver path (uses `webdriver_manager`).


name: Selenium Tests

### Git workflow .yaml usage


```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Build Docker image ...
      - name: Run Docker container ...
      - name: Wait for app to start ...

      - name: Run Selenium Headless Tests
        run: |
            cd selenium
            pytest -v testHeadless.py

      - name: Stop Docker container ...

```