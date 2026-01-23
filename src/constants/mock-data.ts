import { Subject } from "../types";

export const MOCK_SUBJECTS: Subject[] = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Computer Science",
    department: "CS",
    description:
      "An introductory course covering the fundamentals of computer science and programming.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    code: "MATH201",
    name: "Calculus II",
    department: "Math",
    description:
      "Advanced topics in calculus, including integration techniques and sequences and series.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    code: "PHYS101",
    name: "General Physics I",
    department: "Physics",
    description:
      "A foundational course in physics covering mechanics, heat, and sound.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    code: "CHEM101",
    name: "General Chemistry I",
    department: "Chemistry",
    description:
      "Introduction to the principles of chemistry, including atomic structure and chemical bonding.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    code: "ENG101",
    name: "College Composition",
    department: "English",
    description:
      "A course focused on developing writing and analytical skills through various essay forms.",
    createdAt: new Date().toISOString(),
  },
];
