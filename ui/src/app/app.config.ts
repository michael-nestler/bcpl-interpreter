import { provideHttpClient, withFetch } from "@angular/common/http";
import { type ApplicationConfig } from "@angular/core";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
  ],
};
