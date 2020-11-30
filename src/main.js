const Apify = require('apify');

const { log } = Apify.utils;

const WEBSITE_CHECKER_ID = 'WTzG8s4tmwNFMbdEA';

const createConfigsWithProxies = (website, scraperType, proxyGroups, maxPagesPerCheck) => {
    const configs = [];
    for (const proxyGroup of proxyGroups) {
        configs.push({
            input: {
                startUrls: [{ url: website }],
                type: scraperType,
                linkSelector: 'a[href]',
                pseudoUrls: [{ purl: `${website}[.+]` }],
                proxyConfiguration: {
                    useApifyProxy: true,
                    apifyProxyGroups: proxyGroup === 'auto' ? undefined : [proxyGroup],
                },
                maxPagesPerCrawl: maxPagesPerCheck,
                saveSnapshots: true,
            },
            params: {
                memoryMbytes: scraperType === 'cheerio' ? 4096 : 8192,
                timeoutSecs: 24 * 3600, // one day
            },
        });
    }
    return configs;
};

// We update the output param instead of returning as that makes it easier
const callWebsiteChecker = async (inputConfig, output) => {
    const { type } = inputConfig.input;
    const proxy = inputConfig.input.proxyConfiguration.apifyProxyGroups || 'auto';
    const checkerDescription = `type ${type} with proxies: ${proxy}`;
    log.info(`Starting Website Checker of ${checkerDescription}`);
    try {
        const runResult = await Apify.call(WEBSITE_CHECKER_ID, inputConfig.input, inputConfig.params);
        log.info(`Website checker run ${runResult.id} finished: ${checkerDescription}`);
        log.info(`Details of the run: https://my.apify.com/actors/${WEBSITE_CHECKER_ID}#/runs/${runResult.id}`);
        log.info('Detailed output of the run: '
            + `https://api.apify.com/v2/key-value-stores/${runResult.defaultKeyValueStoreId}/records/DETAILED-OUTPUT?disableRedirect=true`);
        const { computeUnits } = runResult.stats;
        const { total } = runResult.output.body;
        const runKey = `${type}/${proxy}`;
        output[runKey] = {
            computeUnits,
            pagesPerComputeUnit: Number((total / computeUnits).toFixed(2)),
            ...runResult.output.body,
        };
    } catch (e) {
        log.warning(`Website checker run failed: ${checkerDescription}`);
        log.warning(`With error: ${e}`);
    }
};

Apify.main(async () => {
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    const {
        website,
        runBrowser = true,
        runCheerio = true,
        runInParallel = true,
        proxyGroups = ['auto', 'BUYPROXIES84958'],
        maxPagesPerCheck = 200,
    } = input;

    if (!website) {
        throw new Error('Wrong input! website has to be provided');
    }

    let runConfigs = [];
    if (runBrowser) {
        runConfigs = runConfigs.concat(createConfigsWithProxies(website, 'puppeteer', proxyGroups, maxPagesPerCheck));
    }
    if (runCheerio) {
        runConfigs = runConfigs.concat(createConfigsWithProxies(website, 'cheerio', proxyGroups, maxPagesPerCheck));
    }

    const output = {};
    const promises = [];

    for (const config of runConfigs) {
        const runPromise = callWebsiteChecker(config, output);
        if (runInParallel) {
            promises.push(runPromise);
        } else {
            await runPromise;
        }
    }

    if (promises.length > 0) {
        await Promise.all(promises);
    }

    await Apify.setValue('OUTPUT', output);

    log.info('All Website Checker runs finished, overall check results can be found here:'
        + `https://api.apify.com/v2/key-value-stores/${Apify.getEnv().defaultKeyValueStoreId}/records/OUTPUT?disableRedirect=true`);
});
