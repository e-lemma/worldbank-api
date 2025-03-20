class CountryInfo {
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
  NationalAccountsBaseYear: string | number
  NationalAccountsReferenceYear: string | number
  SnaPriceValuation: string
  LendingCategory: string
  OtherGroups: string
  SystemOfNationalAccounts: string
  AlternativeConversionFactor: string
  PppSurveyYear: string | number
  BalanceOfPaymentsManualInUse: string
  ExternalDebtReportingStatus: string
  SystemOfTrade: string
  GovernmentAccountingConcept: string
  ImfDataDisseminationStandard: string
  LatestPopulationCensus: string | number
  LatestHouseholdSurvey: string
  SourceOfMostRecentIncomeAndExpenditureData: string
  VitalRegistrationComplete: string
  LatestAgriculturalCensus: string | number
  LatestIndustrialData: string | number
  LatestTradeData: string | number
  LatestWaterWithdrawalData: string | number

  constructor(
    CountryCode: string,
    ShortName: string,
    TableName: string,
    LongName: string,
    Alpha2Code: string,
    CurrencyUnit: string,
    SpecialNotes: string,
    Region: string,
    IncomeGroup: string,
    Wb2Code: string,
    NationalAccountsBaseYear: string | number,
    NationalAccountsReferenceYear: string | number,
    SnaPriceValuation: string,
    LendingCategory: string,
    OtherGroups: string,
    SystemOfNationalAccounts: string,
    AlternativeConversionFactor: string,
    PppSurveyYear: string | number,
    BalanceOfPaymentsManualInUse: string,
    ExternalDebtReportingStatus: string,
    SystemOfTrade: string,
    GovernmentAccountingConcept: string,
    ImfDataDisseminationStandard: string,
    LatestPopulationCensus: string | number,
    LatestHouseholdSurvey: string,
    SourceOfMostRecentIncomeAndExpenditureData: string,
    VitalRegistrationComplete: string,
    LatestAgriculturalCensus: string | number,
    LatestIndustrialData: string | number,
    LatestTradeData: string | number,
    LatestWaterWithdrawalData: string | number
  ) {
    this.CountryCode = CountryCode
    this.ShortName = ShortName
    this.TableName = TableName
    this.LongName = LongName
    this.Alpha2Code = Alpha2Code
    this.CurrencyUnit = CurrencyUnit
    this.SpecialNotes = SpecialNotes
    this.Region = Region
    this.IncomeGroup = IncomeGroup
    this.Wb2Code = Wb2Code
    this.NationalAccountsBaseYear = NationalAccountsBaseYear
    this.NationalAccountsReferenceYear = NationalAccountsReferenceYear
    this.SnaPriceValuation = SnaPriceValuation
    this.LendingCategory = LendingCategory
    this.OtherGroups = OtherGroups
    this.SystemOfNationalAccounts = SystemOfNationalAccounts
    this.AlternativeConversionFactor = AlternativeConversionFactor
    this.PppSurveyYear = PppSurveyYear
    this.BalanceOfPaymentsManualInUse = BalanceOfPaymentsManualInUse
    this.ExternalDebtReportingStatus = ExternalDebtReportingStatus
    this.SystemOfTrade = SystemOfTrade
    this.GovernmentAccountingConcept = GovernmentAccountingConcept
    this.ImfDataDisseminationStandard = ImfDataDisseminationStandard
    this.LatestPopulationCensus = LatestPopulationCensus
    this.LatestHouseholdSurvey = LatestHouseholdSurvey
    this.SourceOfMostRecentIncomeAndExpenditureData =
      SourceOfMostRecentIncomeAndExpenditureData
    this.VitalRegistrationComplete = VitalRegistrationComplete
    this.LatestAgriculturalCensus = LatestAgriculturalCensus
    this.LatestIndustrialData = LatestIndustrialData
    this.LatestTradeData = LatestTradeData
    this.LatestWaterWithdrawalData = LatestWaterWithdrawalData
  }
}

class CountryIndicator {
  CountryCode: string
  CountryName: string
  IndicatorName: string
  IndicatorCode: string
  Year: number
  Value: number

  constructor(
    countryName: string,
    countryCode: string,
    indicatorName: string,
    indicatorCode: string,
    year: number,
    value: number
  ) {
    this.CountryName = countryName
    this.CountryCode = countryCode
    this.IndicatorName = indicatorName
    this.IndicatorCode = indicatorCode
    this.Year = year
    this.Value = value
  }
}

type CountryRow = { [key: string]: string | number | undefined }

export { CountryInfo, CountryIndicator, CountryRow }
