import { Response } from "express";
import BookInstance from "../models/bookinstance";
import { showAllBooksStatus } from "../pages/books_status";

describe("showAllBooksStatus", () => {
    // Arrange: Prepare mock data and response object
    let res: Partial<Response>;
    const mockBookInstances = [
        { book: { title: "Mock Book Title" }, status: "Available" },
        { book: { title: "Mock Book Title 2" }, status: "Available" },
    ];
    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should handle errors gracefully and return 500", async () => {
        // Mock the BookInstance model's find method to throw an error
        const mockFind = jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error("Database error")),
        });
        BookInstance.find = mockFind;

        // Act: Call the function
        await showAllBooksStatus(res as Response);

        // Assert: Check if the response is correct
        expect(mockFind).toHaveBeenCalledWith({ status: { $eq: "Available" } });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Status not found");
    });

});