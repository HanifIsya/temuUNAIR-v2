export function formatCampusName(campus: string): string {
  switch (campus) {
    case "KAMPUS_A":
      return "Kampus A";
    case "KAMPUS_B":
      return "Kampus B";
    case "KAMPUS_C":
      return "Kampus C";
    case "BANYUWANGI":
      return "Kampus Banyuwangi";
    default:
      return campus;
  }
}
