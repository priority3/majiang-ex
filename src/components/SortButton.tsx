interface SortButtonProps {
  isSorted: boolean
  onClick: () => void
}

export function SortButton({ isSorted, onClick }: SortButtonProps) {
  return (
    <button
      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
      onClick={onClick}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isSorted
          ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            )
          : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9M3 12h5"
              />
            )}
      </svg>
      {isSorted ? '乱序' : '排序'}
    </button>
  )
}
