interface CountryInfo {
  CountryCode: string
  ShortName: string
  TableName: string
  LongName: string
  Alpha2Code: string
  CurrencyUnit: string
  SpecialNotes: string
  Region: string
  IncomeGroup: string
  Wb2Code: string
  NationalAccountsBaseYear: string
  NationalAccountsReferenceYear: string
  SnaPriceValuation: string
  LendingCategory: string
  OtherGroups: string
  SystemOfNationalAccounts: string
  AlternativeConversionFactor: string
  PppSurveyYear: string
  BalanceOfPaymentsManualInUse: string
  ExternalDebtReportingStatus: string
  SystemOfTrade: string
  GovernmentAccountingConcept: string
  ImfDataDisseminationStandard: string
  LatestPopulationCensus: string
  LatestHouseholdSurvey: string
  SourceOfMostRecentIncomeAndExpenditureData: string
  VitalRegistrationComplete: string
  LatestAgriculturalCensus: string
  LatestIndustrialData: string
  LatestTradeData: string
  LatestWaterWithdrawalData: string
}

interface Indicator {
    IndicatorName: string
    IndicatorCode: string
    Year: number
    Value: number
}

class CountryIndicator {
    CountryName: string
    CountryCode: string
    Indicators: Indicator[]


    constructor(countryName: string, countryCode: string, indicators: Indicator[]){
        this.CountryName = countryName
        this.CountryCode = countryCode
        this.Indicators = indicators
    }
}

export {CountryInfo, Indicator, CountryIndicator}