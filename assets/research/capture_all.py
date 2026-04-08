from playwright.sync_api import sync_playwright
import os
import time

SITES = [
    ("semji", "https://www.semji.com"),
    ("eskimoz", "https://www.eskimoz.fr"),
    ("livementor", "https://www.livementor.com"),
    ("openclassrooms", "https://www.openclassrooms.com"),
    ("digitad", "https://www.digitad.ca"),
    ("noiise", "https://www.noiise.com"),
    ("1ere-position", "https://www.1ere-position.fr"),
    ("oncrawl", "https://www.oncrawl.com"),
    ("hubspot-fr", "https://www.hubspot.fr"),
    ("junto", "https://www.junto.fr"),
]

OUTPUT_DIR = "/Users/youssef/neopulsion/assets/research"

def capture_site(name, url, browser):
    print(f"Capturing {name} ({url})...")
    try:
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            locale="fr-FR",
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        # Dismiss cookie banners after load
        page.goto(url, wait_until="networkidle", timeout=30000)
        time.sleep(2)

        # Try to dismiss common cookie banners
        for selector in [
            "text=Accepter",
            "text=Accept",
            "text=Tout accepter",
            "text=Accept all",
            "text=J'accepte",
            "text=OK",
            "[id*='cookie'] button",
            "[class*='cookie'] button",
            "[id*='consent'] button",
            "[class*='consent'] button",
            "button:has-text('Accepter')",
            "button:has-text('Tout accepter')",
        ]:
            try:
                el = page.locator(selector).first
                if el.is_visible(timeout=500):
                    el.click()
                    time.sleep(0.5)
                    break
            except:
                continue

        time.sleep(1)

        # Above-the-fold screenshot
        path_atf = os.path.join(OUTPUT_DIR, f"{name}-desktop.png")
        page.screenshot(path=path_atf, full_page=False)
        print(f"  Saved: {path_atf}")

        # Full page screenshot
        path_full = os.path.join(OUTPUT_DIR, f"{name}-full.png")
        page.screenshot(path=path_full, full_page=True)
        print(f"  Saved: {path_full}")

        context.close()
        print(f"  Done: {name}")
    except Exception as e:
        print(f"  ERROR on {name}: {e}")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for name, url in SITES:
            capture_site(name, url, browser)
        browser.close()
    print("\nAll captures complete.")

if __name__ == "__main__":
    main()
