"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FolderClosed,
  FolderOpen,
} from "lucide-react";

type StatusCounts = {
  Open: number;
  Pending: number;
  Approved: number;
  Rejected: number;
};

type Category = {
  title: string;
  children: StatusCounts;
};

type Folder =
  | {
      title: string;
      categories: Category[];
    }
  | {
      title: string;
      children: StatusCounts;
    };

const folderStructure: Folder[] = [
  {
    title: "Advances",
    categories: [
      {
        title: "Salary Advance",
        children: {
          Open: 1,
          Pending: 2,
          Approved: 1,
          Rejected: 0,
        },
      },
      {
        title: "Travel Advance",
        children: {
          Open: 3,
          Pending: 1,
          Approved: 4,
          Rejected: 0,
        },
      },
      {
        title: "Operational Advance",
        children: {
          Open: 0,
          Pending: 0,
          Approved: 2,
          Rejected: 1,
        },
      },
    ],
  },
  {
    title: "Requisitions",
    children: {
      Open: 2,
      Pending: 4,
      Approved: 6,
      Rejected: 1,
    },
  },
];

export default function TreeFolderCard() {
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [openSubFolders, setOpenSubFolders] = useState<Record<string, boolean>>(
    {}
  );

  const toggleMain = (title: string) => {
    setOpenSubFolders({});
    setOpenFolder(openFolder === title ? null : title);
  };

  const toggleSub = (title: string) => {
    setOpenSubFolders((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="card">
      <div className="card-header bg-danger">
        <h4 className="card-title text-white mb-0">Requests Tree View</h4>
      </div>
      <div className="card-body">
        <ul className="list-unstyled ms-2">
          {folderStructure.map((folder) => (
            <li key={folder.title}>
              <div
                className="d-flex align-items-center cursor-pointer py-1"
                onClick={() => toggleMain(folder.title)}
              >
                <span className="d-flex align-items-center">
                  {openFolder === folder.title ? (
                    <ChevronDown size={18} className="me-2 text-danger" />
                  ) : (
                    <ChevronRight size={18} className="me-2 text-secondary" />
                  )}
                  {openFolder === folder.title ? (
                    <FolderOpen className="me-2 text-warning" size={18} />
                  ) : (
                    <FolderClosed className="me-2 text-secondary" size={18} />
                  )}
                </span>
                <strong>{folder.title}</strong>
              </div>

              {/* Expanded Category View */}
              {openFolder === folder.title &&
                "categories" in folder &&
                Array.isArray(folder.categories) && (
                  <ul className="list-unstyled ms-4">
                    {folder.categories.map((cat) => (
                      <li key={cat.title}>
                        <div
                          className="d-flex align-items-center cursor-pointer py-1"
                          onClick={() => toggleSub(cat.title)}
                        >
                          {openSubFolders[cat.title] ? (
                            <ChevronDown
                              size={16}
                              className="me-2 text-danger"
                            />
                          ) : (
                            <ChevronRight
                              size={16}
                              className="me-2 text-secondary"
                            />
                          )}
                          <span>{cat.title}</span>
                        </div>

                        {openSubFolders[cat.title] && (
                          <ul className="list-unstyled ms-4">
                            {Object.entries(cat.children).map(
                              ([status, count]) => (
                                <li
                                  key={status}
                                  className="py-1 d-flex align-items-center"
                                >
                                  <span className="text-muted">
                                    {status} ({count})
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

              {/* Expanded Flat View */}
              {openFolder === folder.title &&
                "children" in folder &&
                typeof folder.children === "object" && (
                  <ul className="list-unstyled ms-4">
                    {Object.entries(folder.children).map(([status, count]) => (
                      <li
                        key={status}
                        className="py-1 d-flex align-items-center"
                      >
                        <span className="text-muted">
                          {status} ({count})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
