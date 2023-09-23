export class CreateCommunityEventDto {
    name: string;
    description: string;
    startDate?: Date;
    endDate?: Date;
    color?: `#${string}`;
    imageUrl?: string;
    approveState?: "pending" | "approved" | "rejected";
}
