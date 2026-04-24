export interface FirmDto {
    id: number;
    nom: string;
    specialite: string;
}

export interface IndustryCount {
    industry: string;
    count: number;
}

export interface JobOffer {
    opportunityId: number;
    jobTitle: string;
    industry: string;
    location: string;
    salaryRange: string;
    firm?: FirmDto;
    // Cross-service Entreprise MS reference
    entrepriseId?: number;
    entrepriseNom?: string;
    entrepriseSecteur?: string;
    entrepriseLogo?: string;
    entrepriseAdresse?: string;
}

export interface JobOfferRequest {
    jobTitle: string;
    entrepriseId: number;
    industry: string;
    location: string;
    salaryRange: string;
}
