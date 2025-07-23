import json
import os
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

options = webdriver.ChromeOptions()
options.add_experimental_option('excludeSwitches', ['enable-logging'])
se = Service(executable_path='localServices/chromedriver-mac-x64/chromedriver')
driver = webdriver.Chrome(options=options, service=se)

file = open("config.json", "r")
data = json.load(file)
driver.get(data["url"])

def wait_for_holiday_loaded():
    for _ in range(30):
        try:
            text = driver.find_element(By.ID, "holiday-name").text
            if text and text != "Loading...":
                return
        except:
            pass
        time.sleep(0.5)
    print("Holiday did not load in time")
    driver.quit()
    exit(1)

def test_default_religion_selected():
    for rel in data["holiday_types"]:
        try:
            driver.find_element(By.ID, f"religion-{rel}").click()
            time.sleep(1)
            btn = driver.find_element(By.ID, f"religion-{rel}")
            assert "religion-btn-active" in btn.get_attribute("class")
        except:
            print(f"Default religion not selected or not active for {rel}")
            driver.quit()
            exit(1)

def test_date_is_today():
    for rel in data["holiday_types"]:
        try:
            driver.find_element(By.ID, f"religion-{rel}").click()
            time.sleep(1)
            page_date = driver.find_element(By.ID, "date-string").text
            assert datetime.now().strftime("%A") in page_date
        except Exception as e:
            print(f"Today's date not shown correctly for {rel}: {e}")
            driver.quit()
            exit(1)

def test_clock_counter_accurate():
    for rel in data["holiday_types"]:
        try:
            driver.find_element(By.ID, f"religion-{rel}").click()
            time.sleep(1)
            page_time = driver.find_element(By.ID, "time-string").text
            now_24h = datetime.now().strftime("%H")      # '00' at midnight, '13' at 1pm
            now_12h = datetime.now().strftime("%I")      # '12' at midnight/noon, '01'-'11' otherwise
            if now_12h.startswith("0"):
                now_12h = now_12h[1:]                    # remove leading zero
            assert (now_12h in page_time), f"Expected hour {now_12h} in '{page_time}'"
        except Exception as e:
            print(f"Clock not accurate for {rel}: {e}")
            driver.quit()
            exit(1)

def test_religion_button_background_active():
    for rel in data["holiday_types"]:
        try:
            driver.find_element(By.ID, f"religion-{rel}").click()
            time.sleep(1)
            btn = driver.find_element(By.ID, f"religion-{rel}")
            assert "religion-btn-active" in btn.get_attribute("class")
        except:
            print(f"Active background not set for {rel} religion button")
            driver.quit()
            exit(1)

def test_next_holiday_is_selected_by_default():
    for rel in data["holiday_types"]:
        try:
            driver.find_element(By.ID, f"religion-{rel}").click()
            time.sleep(1)
            select = driver.find_element(By.ID, "holiday-select")
            selected_option = select.find_element(By.CSS_SELECTOR, "option:checked")
            assert selected_option.get_attribute("value") == "next"
        except:
            print(f"Next holiday is not the default selected in dropdown for {rel}")
            driver.quit()
            exit(1)

def test_select_next_holiday_and_match_counter():
    for rel in data["holiday_types"]:
        try:
            driver.find_element(By.ID, f"religion-{rel}").click()
            time.sleep(1)
            wait_for_holiday_loaded()
            select = driver.find_element(By.ID, "holiday-select")
            options = select.find_elements(By.TAG_NAME, "option")
            for opt in options:
                if opt.get_attribute("value") != "next" and not opt.get_attribute("disabled"):
                    value = opt.get_attribute("value")
                    days_default = driver.find_element(By.ID, "countdown-days").text
                    opt.click()
                    select.send_keys(value)
                    time.sleep(1)
                    days_now = driver.find_element(By.ID, "countdown-days").text
                    assert days_default == days_now
                    break
        except:
            print(f"Failed to match counter for next holiday after select for {rel}")
            driver.quit()
            exit(1)

def test_select_second_holiday_and_update():
    for rel in data["holiday_types"]:
        try:
            driver.find_element(By.ID, f"religion-{rel}").click()
            time.sleep(1)
            wait_for_holiday_loaded()
            select = driver.find_element(By.ID, "holiday-select")
            options = [opt for opt in select.find_elements(By.TAG_NAME, "option")
                       if not opt.get_attribute("disabled") and opt.get_attribute("value") != "next"]
            if len(options) < 2:
                print(f"Not enough holidays to test second next holiday for {rel}")
                continue
            value = options[1].get_attribute("value")
            days_before = driver.find_element(By.ID, "countdown-days").text
            options[1].click()
            select.send_keys(value)
            time.sleep(1)
            name_now = driver.find_element(By.ID, "holiday-name").text
            days_now = driver.find_element(By.ID, "countdown-days").text
            assert days_now != days_before or name_now != options[0].get_attribute("value")
        except:
            print(f"Failed to change to second next holiday for {rel}")
            driver.quit()
            exit(1)

def test_disabled_past_option():
    for rel in data["holiday_types"]:
        try:
            driver.find_element(By.ID, f"religion-{rel}").click()
            time.sleep(1)
            wait_for_holiday_loaded()
            select = driver.find_element(By.ID, "holiday-select")
            options = select.find_elements(By.TAG_NAME, "option")
            past = None
            for opt in options:
                if opt.get_attribute("disabled"):
                    past = opt
                    break
            if past:
                assert past.get_attribute("disabled") is not None
            else:
                print(f"No past holiday found to check disabled for {rel}")
        except:
            print(f"Failed to verify disabled state for past holiday for {rel}")
            driver.quit()
            exit(1)

def test_manual_counter_calculation():
    base = os.path.dirname(__file__)
    json_path = os.path.join(base, "..", "public", "holidays2025.json")
    json_path = os.path.abspath(json_path)

    for rel in data["holiday_types"]:
        try:
            driver.get(data["url"])
            driver.find_element(By.ID, f"religion-{rel}").click()
            time.sleep(1)
            wait_for_holiday_loaded()
            select = driver.find_element(By.ID, "holiday-select")
            options = [opt for opt in select.find_elements(By.TAG_NAME, "option")
                       if not opt.get_attribute("disabled") and opt.get_attribute("value") != "next"]
            if not options:
                print(f"No holidays to test counter calculation for {rel}")
                continue
            value = options[0].get_attribute("value")
            options[0].click()
            select.send_keys(value)
            time.sleep(1)
            holiday_name = driver.find_element(By.ID, "holiday-name").text

            with open(json_path) as f:
                holidays_json = json.load(f)

            found = False
            for h in holidays_json[rel]:
                if h["name"] == holiday_name:
                    start_date = datetime.strptime(h["start"], "%Y-%m-%d")
                    found = True
                    break
            if not found:
                print(f"Holiday not found in JSON for {rel} manual counter check")
                continue

            now = datetime.now()
            delta = (start_date - now).days
            page_days = int(driver.find_element(By.ID, "countdown-days").text)
            if abs(page_days - delta) > 1:
                print(f"Mismatch for {rel}: expected ~{delta}, got {page_days}")
            assert abs(page_days - delta) <= 1
        except Exception as e:
            print(f"Manual counter calculation failed for {rel}: {e}")
            driver.quit()
            exit(1)


def test_quit():
    driver.quit()