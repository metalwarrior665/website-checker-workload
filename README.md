# Website checker workload

Creates reasonable workloads for analyzing any website with [Website Checker](https://apify.com/lukaskrivka/website-checker) and combines the resulting data. This is the easiest way to analyze any website for compute units usage and blocking.

This actor runs a Website Checker for each proxy group and for both browser/Puppeteer and Cheerio scraper. Those checks are run in parallel with reasonable default values and the output of all checkers in combined into a single output breakdown. This gives you quite a nice idea how difficult and costly will be scraping the site with different methods and can save precious time you would spend with manual checks.

## Input
| Field | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| website | String | https://apify.com | Website URL where you want to start checking |
| runBrowser | Boolean | true | Run the checker with browser |
| runCheerio | Boolean | true | Check with Cheerio  |
| proxyGroups | Array | ['auto', 'BUYPROXIES84958'] | List of proxy groups you want to test. Can be also `auto` to run with all proxies |
| maxPagesPerCheck | Number | 200 | Max pages per each check |
| runInParallel | Boolean | true | What to scrape from each page, default is "posts" the other option is "comments" |

## Output
The output is saved to the default Key-Value store as `OUTPUT` record. It is a combined output from all Website Checker runs with added spent compute units
```json
{
    "puppeteer/auto": {
        "computeUnits": 0.45,
        "pagesPerComputeUnit": 444,
        "timeouted": 0,
        "failedToLoadOther": 9,
        "accessDenied": 0,
        "recaptcha": 0,
        "distilCaptcha": 24,
        "statusCodes": {
            "200": 3,
            "401": 2,
            "403": 5,
            "405": 24
        },
        "total": 43
    },
    "puppeteer/BUYPROXIES84958": {
        "computeUnits": 0.45,
        "pagesPerComputeUnit": 444,
        "timeouted": 0,
        "failedToLoadOther": 9,
        "accessDenied": 0,
        "recaptcha": 0,
        "distilCaptcha": 24,
        "statusCodes": {
            "200": 3,
            "401": 2,
            "403": 5,
            "405": 24
        },
        "total": 43
    },
    "cheerio/auto": {
        "computeUnits": 0.05,
        "pagesPerComputeUnit": 4000,
        "timeouted": 0,
        "failedToLoadOther": 9,
        "accessDenied": 0,
        "recaptcha": 0,
        "distilCaptcha": 24,
        "statusCodes": {
            "200": 3,
            "401": 2,
            "403": 5,
            "405": 24
        },
        "total": 43
    },
    "cheerio/BUYPROXIES84958": {
        "computeUnits": 0.05,
        "pagesPerComputeUnit": 4000,
        "timeouted": 0,
        "failedToLoadOther": 9,
        "accessDenied": 0,
        "recaptcha": 0,
        "distilCaptcha": 24,
        "statusCodes": {
            "200": 3,
            "401": 2,
            "403": 5,
            "405": 24
        },
        "total": 43
    },
}
```
