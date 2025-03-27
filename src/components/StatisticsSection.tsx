interface StatisticsSectionProps {
  attemptTimes: number[]
  completedHands: number
  currentAttemptTime: number | null
}

export function StatisticsSection({
  attemptTimes,
  completedHands,
  currentAttemptTime,
}: StatisticsSectionProps) {
  const averageTime = attemptTimes.length > 0
    ? Math.round(attemptTimes.reduce((a, b) => a + b, 0) / attemptTimes.length)
    : null

  const successRate = attemptTimes.length > 0
    ? Math.round((completedHands / attemptTimes.length) * 100)
    : 0

  if (attemptTimes.length === 0 && currentAttemptTime === null) {
    return null
  }

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center text-gray-600">
      <div className="grid grid-cols-3 gap-4">
        <div>
          平均用时：
          {' '}
          {averageTime}
          {' '}
          秒
        </div>
        <div>
          完成手牌：
          {' '}
          {completedHands}
          {' '}
          副
        </div>
        <div>
          成功率：
          {' '}
          {successRate}
          %
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        共
        {' '}
        {attemptTimes.length}
        {' '}
        次尝试
      </div>
    </div>
  )
}
