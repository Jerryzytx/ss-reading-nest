import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  BookOpen,
  Coffee,
  Crown,
  Eye,
  Ellipsis,
  History,
  LoaderCircle,
  Maximize2,
  Plus,
  RefreshCw,
  Settings2,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { EstateIllustration } from "../components/EstateIllustration.js";
import type {
  ReadingRecord as StoredReadingRecord,
  SessionBundle,
  SourceAvailability
} from "@ss/shared";

export type BookshelfItem = SessionBundle & {
  sourceAvailability: SourceAvailability;
};

type Filter = "all" | "active" | "completed" | "missing";
type LibraryView = "library" | "records";
export type LibrarySkin = "blue" | "pink" | "beige" | "green";

type ReadingRecordView = {
  id: string;
  bookTitle: string;
  dateKey: string;
  dateLabel: string;
  weekday: string;
  timeRange: string;
  durationSeconds: number;
  startPage: number;
  endPage: number;
  pagesRead: number;
  bookTotalPages: number;
  bookProgressPercent: number;
  note: string;
  intensity: number;
};

type DailyReading = {
  id: string;
  label: string;
  seconds: number;
};

type BarStyle = CSSProperties & { "--bar-height": string };

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "active", label: "阅读中" },
  { value: "completed", label: "已完成" },
  { value: "missing", label: "正文缺失" }
];

const LIBRARY_NAV: Array<{
  label: string;
  icon: LucideIcon;
  view: LibraryView;
}> = [
  { label: "我的书房", icon: BookOpen, view: "library" },
  { label: "阅读记录", icon: History, view: "records" }
];

export function Home(props: {
  bookshelf: BookshelfItem[];
  readingRecords?: StoredReadingRecord[];
  loading?: boolean;
  loadError?: boolean;
  onRefresh?: () => void;
  onNew: () => void;
  onOpen: (item: BookshelfItem) => void;
  onReimport: (item: BookshelfItem) => void;
  onManage: (item: BookshelfItem) => void;
  onExpand?: () => void;
  skin: LibrarySkin;
  onSkinChange: (skin: LibrarySkin) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<LibraryView>("library");
  const novels = useMemo(
    () => props.bookshelf.filter((item) => item.session.type === "novel"),
    [props.bookshelf]
  );
  const visible = useMemo(
    () =>
      novels.filter((item) => {
        if (filter === "active" || filter === "completed") {
          return item.session.status === filter;
        }
        if (filter === "missing") {
          return [
            "cloud_missing",
            "cloud_restore_failed",
            "local_only_missing"
          ].includes(item.sourceAvailability);
        }
        return true;
      }),
    [filter, novels]
  );
  const continueItem = useMemo(
    () =>
      novels.find((item) => item.session.status === "active") ??
      novels[0] ??
      null,
    [novels]
  );
  const records = useMemo(
    () => buildReadingRecords(props.readingRecords ?? [], novels),
    [props.readingRecords, novels]
  );
  const headerCopy =
    view === "records"
      ? {
          title: "阅读记录",
          subtitle: "有些故事读完了，我们还会想起。"
        }
      : {
          title: "我们的书房",
          subtitle: "你读一段，我陪一段。每一页都可以聊一会儿。"
        };

  return (
    <main className="library-app-shell">
      <aside className="library-rail" aria-label="书屋导航">
        <span className="estate-rail-monogram" aria-hidden="true">E<span>&amp;</span>A</span>
        <strong className="rail-brand">优雅与艺术<small>ELEGANCE &amp; THE ARTS</small></strong>
        <span className="estate-rail-owner">鼠鼠 · 纪清和</span>
        <nav>
          {LIBRARY_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className="library-rail-item"
                aria-current={item.view === view ? "page" : undefined}
                onClick={() => setView(item.view)}
              >
                <Icon className="library-rail-icon" aria-hidden="true" strokeWidth={1.75} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="home-shell">
        <header className="library-header estate-library-header">
          <span className="visually-hidden">鼠鼠与纪清和的书屋</span>
          <section className="estate-hero" aria-label="优雅与艺术 · 私人庄园阅览室">
            <EstateIllustration />
            <div className="estate-hero-content">
              <div className="estate-hero-eyebrow"><span>THE PRIVATE READING SOCIETY</span><span>EST. MMXXVI</span></div>
              <span className="estate-hero-crest" aria-hidden="true"><Crown strokeWidth={1.25} /></span>
              <h1>优雅与艺术</h1>
              <p className="estate-hero-english">ELEGANCE &amp; THE ARTS</p>
              <span className="estate-hero-ornament" aria-hidden="true">✦</span>
              <p className="estate-hero-motto">在这里，阅读是正事。刻薄只是副产品。</p>
              <small className="estate-hero-signature">MOUSE &amp; LADY QINGHE · THE ESTATE LIBRARY</small>
            </div>
          </section>
          <div className="estate-room-row">
            <div className="estate-room-heading">
              <span className="estate-room-kicker">THE LIBRARY · VOL. I</span>
              <h2>{headerCopy.title}</h2>
              <p>{headerCopy.subtitle}</p>
            </div>
            {view === "library" ? (
              <div className="library-header-actions">
                {props.onExpand ? (
                  <button type="button" className="library-quiet-action" onClick={props.onExpand}>
                    <Maximize2 className="library-action-icon" aria-hidden="true" strokeWidth={1.8} />
                    <span>展开书房</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  className="library-add"
                  aria-label="小说共读：导入小说"
                  onClick={props.onNew}
                >
                  <Plus className="library-action-icon" aria-hidden="true" strokeWidth={1.9} />
                  <span>添置藏书</span>
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div className="estate-etiquette" aria-label="庄园守则">
          <Coffee aria-hidden="true" strokeWidth={1.6} />
          <span><strong>庄园守则 · NO. 01</strong> 本庄园禁止恶意批评。所有恶意批评均须以艺术鉴赏的名义进行。</span>
        </div>

        <div className="library-skin-switch" aria-label="界面皮肤">
          <span>换肤</span>
          <button
            type="button"
            aria-pressed={props.skin === "blue"}
            onClick={() => props.onSkinChange("blue")}
          >
            庄园
          </button>
          <button
            type="button"
            aria-pressed={props.skin === "pink"}
            onClick={() => props.onSkinChange("pink")}
          >
            粉桃
          </button>
          <button
            type="button"
            aria-pressed={props.skin === "beige"}
            onClick={() => props.onSkinChange("beige")}
          >
            米白
          </button>
          <button
            type="button"
            aria-pressed={props.skin === "green"}
            onClick={() => props.onSkinChange("green")}
          >
            墨绿
          </button>
        </div>

        <div className="library-mobile-tabs" aria-label="书屋视图">
          <button
            type="button"
            aria-pressed={view === "library"}
            onClick={() => setView("library")}
          >
            我的书房
          </button>
          <button
            type="button"
            aria-pressed={view === "records"}
            onClick={() => setView("records")}
          >
            阅读记录
          </button>
        </div>

        {view === "library" ? (
          <>
            {filter === "all" && continueItem ? (
              <ContinueReadingCard
                item={continueItem}
                onOpen={props.onOpen}
                onManage={props.onManage}
              />
            ) : null}

            <section className="bookshelf-section" aria-label="小说书架">
              <div className="section-heading">
                <h2>庄园藏书</h2>
                <span>{novels.length} 本小说</span>
              </div>
              <div className="bookshelf-filters" aria-label="书架筛选">
                {FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={filter === option.value}
                    onClick={() => setFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {props.loading && novels.length === 0 ? (
                <div className="empty-nest empty-nest-status" role="status">
                  <LoaderCircle className="empty-nest-icon is-spinning" aria-hidden="true" strokeWidth={1.8} />
                  <p>正在找回你的小说书架…</p>
                </div>
              ) : props.loadError && novels.length === 0 ? (
                <div className="empty-nest empty-nest-status" role="alert">
                  <RefreshCw className="empty-nest-icon" aria-hidden="true" strokeWidth={1.8} />
                  <p>书架暂时没有读取成功，小说仍在云端。</p>
                  {props.onRefresh ? (
                    <button type="button" className="book-action" onClick={props.onRefresh}>
                      <RefreshCw aria-hidden="true" strokeWidth={1.8} />
                      重新读取书架
                    </button>
                  ) : null}
                </div>
              ) : novels.length === 0 ? (
                <div className="empty-nest">藏书室尚且空荡。夫人已备好红茶，只缺一本值得评论的书。</div>
              ) : visible.length === 0 ? (
                <div className="empty-nest">这个筛选下还没有小说。</div>
              ) : (
                <div className="library-book-grid">
                  {visible.map((item, index) => (
                    <LibraryBookCard
                      key={item.session.id}
                      item={item}
                      palette={index % 6}
                      onOpen={props.onOpen}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <ReadingRecordsView records={records} />
        )}
      </section>
    </main>
  );
}

function ReadingRecordsView(props: { records: ReadingRecordView[] }) {
  const totalSeconds = props.records.reduce((sum, record) => sum + record.durationSeconds, 0);
  const totalPages = props.records.reduce((sum, record) => sum + record.pagesRead, 0);
  const todayKey = dateKey(new Date());
  const todaySeconds = props.records
    .filter((record) => record.dateKey === todayKey)
    .reduce((sum, record) => sum + record.durationSeconds, 0);
  const averageSeconds = props.records.length > 0 ? Math.round(totalSeconds / props.records.length) : 0;
  const days = buildDailyReading(props.records);
  const maxSeconds = Math.max(1, ...days.map((day) => day.seconds));
  const trend = buildTrend(days, maxSeconds);

  if (props.records.length === 0) {
    return (
      <section className="reading-records-empty" aria-label="阅读记录">
        <Sparkles className="records-empty-icon" aria-hidden="true" strokeWidth={1.6} />
        <h2>还没有阅读记录</h2>
        <p>开始真实阅读后，这里会记录每次开始、结束和停留的页数。</p>
      </section>
    );
  }

  return (
    <section className="reading-records-view" aria-label="阅读记录">
      <div className="records-hero">
        <div className="records-hero-copy">
          <span>14 天累计 · 真实数据</span>
          <h2>{formatDuration(totalSeconds)}</h2>
          <p>被安静地留在书页里</p>
          <small>日期、时间段、时长、页数和阅读节奏，都会从真实阅读会话里慢慢长出来。</small>
        </div>
        <blockquote>夜里翻页的声音，像在替我把书页收好。</blockquote>
      </div>

      <div className="records-metrics" aria-label="阅读统计">
        <RecordMetric label="今日阅读" value={formatDuration(todaySeconds)} detail="今天真实停留" />
        <RecordMetric label="累计时长" value={formatDuration(totalSeconds)} detail={`${props.records.length} 次阅读`} />
        <RecordMetric label="读过页数" value={`${totalPages} 页`} detail="真实累计" />
        <RecordMetric label="平均一次" value={formatDuration(averageSeconds)} detail="按会话估算" />
      </div>

      <div className="records-visual-grid">
        <section className="records-card records-heat-card">
          <header>
            <span>阅读节奏</span>
            <strong>近 14 天</strong>
          </header>
          <svg className="records-trend" viewBox="0 0 540 200" role="img" aria-label="近14天每日阅读分钟折线图">
            <defs>
              <linearGradient id="recordsTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9abdd2" stopOpacity=".3" />
                <stop offset="100%" stopColor="#9abdd2" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line className="records-trend-base" x1="44" y1="168" x2="524" y2="168" />
            <path className="records-trend-area" d={trend.areaPath} />
            <polyline className="records-trend-line" points={trend.pointString} />
            {trend.points.map((point) => (
              <g key={point.id}>
                <circle className="records-trend-glow" cx={point.x} cy={point.y} r={point.isPeak ? 9 : 6} />
                <circle className="records-trend-dot" cx={point.x} cy={point.y} r="3.4" />
                {point.isPeak ? (
                  <path
                    className="records-trend-star"
                    d={`M${point.x},${point.y - 11} l3.2,5.8 l5.8,3.2 l-5.8,3.2 l-3.2,5.8 l-3.2,-5.8 l-5.8,-3.2 l5.8,-3.2 Z`}
                  />
                ) : null}
                <title>{point.label} · {formatDuration(point.seconds)}</title>
              </g>
            ))}
            <text className="records-trend-label" x="44" y="185" textAnchor="middle">{days[0]?.label}</text>
            <text className="records-trend-label" x="524" y="185" textAnchor="middle">{days.at(-1)?.label}</text>
          </svg>
        </section>

        <section className="records-card records-flow-card">
          <header>
            <span>时间流</span>
            <strong>每日停留</strong>
          </header>
          <div className="records-bars" aria-label="每日阅读时长">
            {days.map((day) => (
              <span key={day.id} className="records-bar-wrap">
                <span
                  className="records-bar"
                  style={{ "--bar-height": `${Math.max(10, (day.seconds / maxSeconds) * 100)}%` } as BarStyle}
                />
                <small>{day.label}</small>
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="records-timeline" aria-label="最近阅读明细">
        <div className="section-heading">
          <h2>最近阅读</h2>
          <span>{props.records.length} 条</span>
        </div>
        <div className="records-list">
          {props.records.map((record) => (
            <article key={record.id} className="record-entry">
              <div className="record-date">
                <strong>{record.dateLabel}</strong>
                <span>{record.weekday}</span>
              </div>
              <div className="record-body">
                <h3>{record.bookTitle}</h3>
                <p>{record.timeRange} · {formatDuration(record.durationSeconds)}</p>
                <div className="record-range">
                  <span>第 {record.startPage} 页</span>
                  <i aria-hidden="true" />
                  <span>第 {record.endPage} 页</span>
                </div>
                <small>{record.note}</small>
              </div>
              <div className="record-progress" aria-label={`已读 ${record.endPage} / ${record.bookTotalPages} 页`}>
                <span>已读 <b>{record.endPage}</b> / {record.bookTotalPages} 页</span>
                <i><b style={{ width: `${record.bookProgressPercent}%` }} /></i>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function RecordMetric(props: { label: string; value: string; detail: string }) {
  return (
    <article className="record-metric">
      <span>{props.label}</span>
      <strong>{props.value}</strong>
      <small>{props.detail}</small>
    </article>
  );
}

function ContinueReadingCard(props: {
  item: BookshelfItem;
  onOpen: (item: BookshelfItem) => void;
  onManage: (item: BookshelfItem) => void;
}) {
  const progress = progressInfo(props.item);
  const thoughtTotal = thoughtCount(props.item);
  const missing = needsSource(props.item);

  return (
    <section className="continue-card" aria-label="继续阅读">
      <DefaultCover item={props.item} palette={0} compact />
      <div className="continue-card-body">
        <span className="continue-status">{missing ? "正文需要补回" : "上次读到这里"}</span>
        <h2
          className="continue-card-title"
          aria-label={props.item.session.title}
          data-title={shortTitle(props.item.session.title)}
        />
        <div className="continue-progress-row">
          <span>{props.item.session.userCurrentPosition.label}</span>
          <span>{progress.percent}%</span>
        </div>
        <div className="continue-progress-track" aria-hidden="true">
          <span style={{ width: `${progress.percent}%` }} />
        </div>
        <p>意绪与清思 {thoughtTotal} 条</p>
      </div>
      <div className="continue-card-actions">
        <button
          type="button"
          className="action-primary"
          onClick={() => props.onOpen(props.item)}
        >
          <Eye aria-hidden="true" strokeWidth={1.8} />
          查看详情
        </button>
        <button
          type="button"
          className="library-quiet-action"
          onClick={() => props.onManage(props.item)}
        >
          <Settings2 aria-hidden="true" strokeWidth={1.8} />
          管理这本书
        </button>
      </div>
    </section>
  );
}

function LibraryBookCard(props: {
  item: BookshelfItem;
  palette: number;
  onOpen: (item: BookshelfItem) => void;
}) {
  const progress = progressInfo(props.item);
  const missing = needsSource(props.item);

  return (
    <button
      type="button"
      className="library-book-card"
      aria-label={`打开《${props.item.session.title}》的封面页`}
      title={props.item.session.title}
      onClick={() => props.onOpen(props.item)}
    >
      <DefaultCover item={props.item} palette={props.palette} />
      <span className="library-book-info">
        <strong>{props.item.session.title}</strong>
        <small>
          {missing ? "正文缺失" : props.item.session.status === "completed" ? "已完成" : `阅读中 · ${progress.percent}%`}
        </small>
      </span>
      <Ellipsis className="library-book-more" aria-hidden="true" strokeWidth={1.8} />
    </button>
  );
}

function DefaultCover(props: { item: BookshelfItem; palette: number; compact?: boolean }) {
  return (
      <span className={`library-cover library-cover-${props.palette} ${props.compact ? "compact" : ""}`} aria-hidden="true">
        <span className="library-cover-shine" />
      <span className="library-cover-title" data-title={coverTitle(props.item.session.title)} />
      <span className="library-cover-mark">E &amp; A · PRIVATE COLLECTION</span>
    </span>
  );
}

function progressInfo(item: BookshelfItem): { percent: number; total: number | null } {
  const total = item.session.userCurrentPosition.total ?? item.session.sourceManifest?.paragraphCount ?? null;
  if (!total || total <= 0) return { percent: item.session.status === "completed" ? 100 : 0, total: null };
  const percent = Math.max(
    0,
    Math.min(100, Math.round((item.session.userCurrentPosition.index / total) * 100))
  );
  return { percent, total };
}

function needsSource(item: BookshelfItem): boolean {
  return !["available_local", "available_cloud", "restoring_from_cloud", "unknown"].includes(
    item.sourceAvailability
  );
}

function thoughtCount(item: BookshelfItem): number {
  const quoteNotes = item.quotes.filter((quote) => quote.note?.trim()).length;
  const clearThoughts = item.quotes.filter((quote) => quote.clearThought?.trim()).length;
  return quoteNotes + clearThoughts + item.reactions.length + item.bookmarks.length;
}

function shortTitle(title: string): string {
  return title.length > 18 ? `${title.slice(0, 18)}…` : title;
}

function coverTitle(title: string): string {
  const mainTitle = title.split(/[：:（(《]/)[0]?.trim();
  const displayTitle = mainTitle || title.trim();
  return displayTitle.length > 8 ? `${displayTitle.slice(0, 8)}…` : displayTitle;
}

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function buildReadingRecords(
  records: StoredReadingRecord[],
  novels: BookshelfItem[]
): ReadingRecordView[] {
  const novelsById = new Map(novels.map((item) => [item.session.id, item]));
  return [...records]
    .sort((left, right) => right.endedAt.localeCompare(left.endedAt))
    .flatMap((record) => {
      const started = new Date(record.startedAt);
      const ended = new Date(record.endedAt);
      if (!isValidDate(started) || !isValidDate(ended)) return [];
      const item = novelsById.get(record.sessionId);
      const total = totalPagesForRecord(record, item);
      const endPage = Math.max(1, Math.min(total, record.endPosition.index));
      const startPage = Math.max(1, Math.min(total, record.startPosition.index));
      const pagesRead = Math.max(1, Math.min(record.pagesRead, total));
      const durationSeconds = Math.max(1, Math.round(record.durationSeconds));

      return [
        {
          id: record.id,
          bookTitle: shortTitle(record.bookTitle || item?.session.title || "未命名作品"),
          dateKey: dateKey(ended),
          dateLabel: dateLabel(ended),
          weekday: WEEKDAYS[ended.getDay()] ?? "今天",
          timeRange: timeRangeFromDates(started, ended),
          durationSeconds,
          startPage,
          endPage,
          pagesRead,
          bookTotalPages: total,
          bookProgressPercent: Math.max(2, Math.min(100, Math.round((endPage / total) * 100))),
          note: readingRecordNote(record),
          intensity: Math.max(18, Math.min(100, Math.round((durationSeconds / 3600) * 100)))
        }
      ];
    });
}

function buildDailyReading(records: ReadingRecordView[]): DailyReading[] {
  const secondsByDate = new Map<string, number>();
  for (const record of records) {
    secondsByDate.set(record.dateKey, (secondsByDate.get(record.dateKey) ?? 0) + record.durationSeconds);
  }

  const baseDate = latestRecordDate(records) ?? new Date();
  return Array.from({ length: 14 }, (_, index) => {
    const date = offsetDate(baseDate, index - 13);
    return {
      id: dateKey(date),
      label: shortDateLabel(date),
      seconds: secondsByDate.get(dateKey(date)) ?? 0
    };
  });
}

function totalPagesForRecord(
  record: StoredReadingRecord,
  item: BookshelfItem | undefined
): number {
  return Math.max(
    1,
    record.endPosition.total ??
      record.startPosition.total ??
      item?.session.userCurrentPosition.total ??
      item?.session.sourceManifest?.paragraphCount ??
      record.endPosition.index,
    record.startPosition.index,
    record.pagesRead
  );
}

function readingRecordNote(record: StoredReadingRecord): string {
  if (record.startPosition.index === record.endPosition.index) {
    return "这一回停留在同一页，把时间真实记下来了。";
  }
  return `从${record.startPosition.label}读到${record.endPosition.label}，这一回翻过 ${record.pagesRead} 页。`;
}

function latestRecordDate(records: ReadingRecordView[]): Date | null {
  const latest = records[0]?.dateKey;
  if (!latest) return null;
  const date = new Date(`${latest}T12:00:00`);
  return isValidDate(date) ? date : null;
}

function isValidDate(date: Date): boolean {
  return Number.isFinite(date.getTime());
}

function offsetDate(base: Date, offsetDays: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + offsetDays);
  return next;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function dateLabel(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function shortDateLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function timeRangeFromDates(started: Date, ended: Date): string {
  return `${clock(started.getHours() * 60 + started.getMinutes())}-${clock(
    ended.getHours() * 60 + ended.getMinutes()
  )}`;
}

function clock(totalMinutes: number): string {
  const minutesInDay = ((totalMinutes % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(minutesInDay / 60))}:${pad2(minutesInDay % 60)}`;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  if (safeSeconds < 60) return safeSeconds > 0 ? `${safeSeconds} 秒` : "0 分钟";
  const minutes = Math.round(safeSeconds / 60);
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} 小时 ${rest} 分` : `${hours} 小时`;
}

function buildTrend(days: DailyReading[], maxSeconds: number) {
  const left = 44;
  const right = 524;
  const baseY = 168;
  const topY = 34;
  const span = Math.max(1, days.length - 1);
  const peak = Math.max(...days.map((day) => day.seconds));
  const points = days.map((day, index) => {
    const x = left + ((right - left) * index) / span;
    const y = baseY - ((baseY - topY) * day.seconds) / maxSeconds;
    return {
      ...day,
      x: roundForSvg(x),
      y: roundForSvg(y),
      isPeak: day.seconds > 0 && day.seconds === peak
    };
  });
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPath = `M${pointString.replaceAll(" ", " L")} L${right},${baseY} L${left},${baseY} Z`;
  return { points, pointString, areaPath };
}

function roundForSvg(value: number): number {
  return Math.round(value * 10) / 10;
}
