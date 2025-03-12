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
class Indicator {
    IndicatorName: string
    IndicatorCode: string
    Year: number
    Value: number

    constructor(indicatorName: string, indicatorCode: string, year: number, value: number){
        this.IndicatorName = indicatorName
        this.IndicatorCode = indicatorCode
        this.Year = year
        this.Value = value
    }
}

class CountryIndicator {
    CountryCode: string
    CountryName: string
    IndicatorName: string
    IndicatorCode: string
    Year: number
    Value: number


    constructor(countryName: string, countryCode: string, indicatorName: string, 
                indicatorCode: string, year: number, value: number){
            
        this.CountryName = countryName
        this.CountryCode = countryCode
        this.IndicatorName = indicatorName
        this.IndicatorCode = indicatorCode
        this.Year = year
        this.Value = value
    }
}

export {CountryInfo, Indicator, CountryIndicator}