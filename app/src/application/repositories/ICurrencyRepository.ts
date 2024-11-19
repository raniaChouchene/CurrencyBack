export interface IcurrencyRepository {
  getAllCryptoData(): Promise<any>;
  saveCryptoData(data: any): Promise<void>;
}
