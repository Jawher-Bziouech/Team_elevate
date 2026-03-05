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
    firm: FirmDto;
}

export interface JobOfferRequest {
    jobTitle: string;
    firmId: number;
    industry: string;
    location: string;
    salaryRange: string;
}
