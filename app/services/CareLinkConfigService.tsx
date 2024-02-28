interface Config {
    supportedCountries: Record<string, { region: string }>;
    CP: { region: string; SSOConfiguration: string }[];
}

class ConfigService {
    private discoveryUrl: string = 'https://clcloud.minimed.eu/connect/carepartner/v6/discover/android/3.1'; // Replace with actual discovery URL

    async getConfig(country: string): Promise<Record<string, any>> {
        try {
            // Fetch configuration data
            const response = await fetch(this.discoveryUrl);
            if (!response.ok) {
                throw new Error('ERROR: Failed to fetch configuration');
            }
            const data: Config = await response.json();

            const countryUpper = country.toUpperCase();
            let region: string | null = null;
            let config: Record<string, any> | null = null;

            // Find region for the given country
            for (const c of Object.values(data.supportedCountries)) {
                if (c[countryUpper] && c[countryUpper].region) {
                    region = c[countryUpper].region;
                    break;
                }
            }

            if (!region) {
                throw new Error(`ERROR: Country code ${country} is not supported`);
            }

            // Find configuration for the region
            for (const c of data.CP) {
                if (c.region === region) {
                    config = c;
                    break;
                }
            }

            if (!config) {
                throw new Error(`ERROR: Failed to get config base URLs for region ${region}`);
            }

            // Fetch SSO configuration
            const ssoResponse = await fetch(config.SSOConfiguration);
            if (!ssoResponse.ok) {
                throw new Error('ERROR: Failed to fetch SSO configuration');
            }
            const ssoConfig = await ssoResponse.json();
            const ssoBaseUrl = `https://${ssoConfig.server.hostname}:${ssoConfig.server.port}/${ssoConfig.server.prefix}`;
            const tokenUrl = `${ssoBaseUrl}${ssoConfig.oauth.system_endpoints.token_endpoint_path}`;
            config.tokenUrl = tokenUrl;

            return config;
        } catch (error) {
            throw error; // Re-throw the error for handling at higher level
        }
    }
}

export default ConfigService;
