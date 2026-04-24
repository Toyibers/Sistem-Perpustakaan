// Types representing Database Schema
export interface Category {
  id: string; // Changed to string (uuid or slug)
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category_id: string;
  description: string;
  cover_url: string;
  stock: number;
}

export interface Borrowing {
  id: string;
  user_id: string;
  book_id: string;
  borrow_date: string;
  return_date: string;
  status: "borrowed" | "returned";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}
