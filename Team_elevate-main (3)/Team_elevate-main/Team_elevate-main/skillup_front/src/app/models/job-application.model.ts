export interface JobApplication {
    id: number;
    jobOfferId: number;
    fullName: string;
    email: string;
    phone?: string;
    coverLetter?: string;
    cvFilePath?: string;
    appliedAt: string;
}
