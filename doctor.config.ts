import type { ReactDoctorConfig } from "react-doctor/api";

export default {
  ignore: {
    files: [
      ".next/**",
      "src/components/ui/**",
    ]
  }
} satisfies ReactDoctorConfig;
