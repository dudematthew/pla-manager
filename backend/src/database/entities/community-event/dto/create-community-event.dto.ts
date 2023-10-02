export class CreateCommunityEventDto {
    name: string;
    description: string;
    reminder?: boolean;
    startDate?: Date;
    endDate?: Date;
    color?: `#${string}`;
    imageUrl?: string;
    approveState?: "pending" | "approved" | "rejected";
}
