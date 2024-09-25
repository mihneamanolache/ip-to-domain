export interface JobData {
  domain:   string;
  date:     string;
}

export interface JobResult {
  success:  boolean;
  result?:  Array<string>;
  error?:   string;
}
