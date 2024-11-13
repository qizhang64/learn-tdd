import Author from '../models/author'; // Adjust the import to your Author model path
import { getAuthorList, showAllAuthors } from '../pages/authors'; // Adjust the import to your function
import { Response } from 'express';
import * as AuthorsModule from '../pages/authors';

// create a mongo to mock, we hope unit test can be easy and quick as possible
// goal: run solid tests
describe('getAuthorList', () => {
    afterEach(() => {
        jest.resetAllMocks(); // create test doubles
    }); // clear it after each test, we don't want one test depend on each other -- decouple them

    it('should fetch and format the authors list correctly', async () => {
        // Define the sorted authors list as we expect it to be returned by the database
        const sortedAuthors = [ // a fake author, not interested in MongoDB database
            {
                first_name: 'Jane',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: new Date('1817-07-18')
            },
            {
                first_name: 'Amitav',
                family_name: 'Ghosh',
                date_of_birth: new Date('1835-11-30'),
                date_of_death: new Date('1910-04-21')
            },
            {
                first_name: 'Rabindranath',
                family_name: 'Tagore',
                date_of_birth: new Date('1812-02-07'),
                date_of_death: new Date('1870-06-09')
            }
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors) // return mock result value
        });

        // Apply the mock directly to the Author model's `find` function
        Author.find = mockFind;

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Check if the result matches the expected sorted output
        const expectedAuthors = [
            'Austen, Jane : 1775 - 1817',
            'Ghosh, Amitav : 1835 - 1910',
            'Tagore, Rabindranath : 1812 - 1870'
        ];
        expect(result).toEqual(expectedAuthors);

        // Verify that `.sort()` was called with the correct parameters
        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);
    });

    // Let simulate we get an author with first name empty
    it('should format fullname as empty string if first name is absent', async () => {
        // Define the sorted authors list as we expect it to be returned by the database
        const sortedAuthors = [
            {
                first_name: '',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: new Date('1817-07-18')
            },
            {
                first_name: 'Amitav',
                family_name: 'Ghosh',
                date_of_birth: new Date('1835-11-30'),
                date_of_death: new Date('1910-04-21')
            },
            {
                first_name: 'Rabindranath',
                family_name: 'Tagore',
                date_of_birth: new Date('1812-02-07'),
                date_of_death: new Date('1870-06-09')
            }
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({ // create a stop
            sort: jest.fn().mockResolvedValue(sortedAuthors) // always return this particular object
        });

        // Apply the mock directly to the Author model's `find` function
        Author.find = mockFind; // replace

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Check if the result matches the expected sorted output
        const expectedAuthors = [
            ' : 1775 - 1817',
            'Ghosh, Amitav : 1835 - 1910',
            'Tagore, Rabindranath : 1812 - 1870'
        ];
        expect(result).toEqual(expectedAuthors);

        // Verify that `.sort()` was called with the correct parameters
        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);
    });

    it('should return an empty array when an error occurs', async () => {
        // Arrange: Mock the Author.find() method to throw an error
        Author.find = jest.fn().mockImplementation(() => { // everytime need Author.find, all this implementation instead
            throw new Error('Database error');
        });

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Verify the result is an empty array
        expect(result).toEqual([]);
    });

    it('should return lifetime with only birthdate for undefined deathdate', async () => {
        // Define the sorted authors list as we expect it to be returned by the database
        const sortedAuthors = [ // a fake author, not interested in MongoDB database
            {
                first_name: 'Jane',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: new Date('1817-07-18')
            },
            {
                first_name: 'Amitav',
                family_name: 'Ghosh',
                date_of_birth: new Date('1835-11-30'),
                date_of_death: new Date('')
            },
            {
                first_name: 'Rabindranath',
                family_name: 'Tagore',
                date_of_birth: new Date('1812-02-07'),
                date_of_death: new Date('1870-06-09')
            }
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors) // return mock result value
        });

        // Apply the mock directly to the Author model's `find` function
        Author.find = mockFind;

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Check if the result matches the expected sorted output
        const expectedAuthors = [
            'Austen, Jane : 1775 - 1817',
            'Ghosh, Amitav : 1835 - ',
            'Tagore, Rabindranath : 1812 - 1870'
        ];
        expect(result).toEqual(expectedAuthors);

        // Verify that `.sort()` was called with the correct parameters
        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);
    });

    it('should return lifetime with only deathdate for unknown birthdate', async () => {
        // Define the sorted authors list as we expect it to be returned by the database
        const sortedAuthors = [
            {
                first_name: 'Jane',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: new Date('1817-07-18')
            },
            {
                first_name: 'Amitav',
                family_name: 'Ghosh',
                date_of_birth: new Date(''),
                date_of_death: new Date('1910-04-21')
            },
            {
                first_name: 'Rabindranath',
                family_name: 'Tagore',
                date_of_birth: new Date('1812-02-07'),
                date_of_death: new Date('1870-06-09')
            }
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({ // create a stop
            sort: jest.fn().mockResolvedValue(sortedAuthors) // always return this particular object
        });

        // Apply the mock directly to the Author model's `find` function
        Author.find = mockFind; // replace

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Check if the result matches the expected sorted output
        const expectedAuthors = [
            'Austen, Jane : 1775 - 1817',
            'Ghosh, Amitav :  - 1910',
            'Tagore, Rabindranath : 1812 - 1870'
        ];
        expect(result).toEqual(expectedAuthors);

        // Verify that `.sort()` was called with the correct parameters
        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);
    });

    it('should return an empty array when an error occurs', async () => {
        Author.find = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        const result = await getAuthorList();

        expect(result).toEqual([]);
    });
    
});

describe('showAllAuthors', () => {
    let res: Response;

    beforeEach(() => {
        res = {
            send: jest.fn(),
        } as unknown as Response;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should send the authors list if data is available', async () => {
        jest.spyOn(AuthorsModule, 'getAuthorList').mockResolvedValueOnce([
            'Austen, Jane : 1775 - 1817',
            'Ghosh, Amitav : 1835 - 1910',
        ]);

        await showAllAuthors(res);
        expect(res.send).toHaveBeenCalledWith([
            'Austen, Jane : 1775 - 1817',
            'Ghosh, Amitav : 1835 - 1910',
        ]);
    });

    it('should send "No authors found" if data is empty', async () => {
        jest.spyOn(AuthorsModule, 'getAuthorList').mockResolvedValueOnce([]);

        await showAllAuthors(res);
        expect(res.send).toHaveBeenCalledWith('No authors found');
    });

    it('should handle errors and send "No authors found"', async () => {
        jest.spyOn(AuthorsModule, 'getAuthorList').mockRejectedValueOnce(new Error('Error'));

        await showAllAuthors(res);
        expect(res.send).toHaveBeenCalledWith('No authors found');
    });
});
