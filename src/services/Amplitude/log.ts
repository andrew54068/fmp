import { getInstance } from "./index";

const IS_LOCAL = import.meta.env.VITE_ENV === "local" || !import.meta.env.VITE_ENV;

const logCore = (name: string, rawProperties: { [key: string]: unknown } = {}) => {
  // strip undefined fields
  const properties = Object.assign({}, rawProperties);
  Object.keys(properties).forEach((key) => properties[key] === undefined && delete properties[key]);

  if (IS_LOCAL) {
    console.debug(`[Amplitude] Event: ${name}, properties:`, properties);
  } else {
    getInstance().track(name, {
      ...properties,
      environment: process.env.REACT_APP_ENV,
    });
  }
};

export const logPageView = (page: string) => {
  if (page) {
    logCore("web_view_page", {
      page,
    });
  }
};

export const logClickMintButton = (account: string) => {
  logCore("click_mint_button", { account });
};

export const logMintError = () => {
  logCore("mint_error");
};

export const logFinishMinting = () => {
  logCore("finish_minting");
};

export const logSweepingButton = () => {
  logCore("click_sweep_button");
};

export const logSweeping = (amount: string) => {
  logCore("sweeping", { amount });
};

export const logOpenAutoSweep = (amount: string) => {
  logCore("open_auto_sweep_tab", { amount });
};

export const logAutoSweepingPurchase = (amount: number) => {
  logCore("click_auto_sweeping_purchase", { amount });
};

export const logCreateBot = (amount: number) => {
  logCore("click_create_bot", { amount });
};

export const logAutoSweepWithdraw = () => {
  logCore("click_auto_sweep_withdraw");
};

export const logAutoSweepDeposit = (amount: number) => {
  logCore("click_auto_sweep_deposit", { amount });
};