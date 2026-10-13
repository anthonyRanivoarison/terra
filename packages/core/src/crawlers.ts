export type CrawlerCategory = "answers" | "indexing" | "training"

export type Crawler = {
  id: string
  name: string
  company: string
  category: CrawlerCategory
  pattern: RegExp
  ipSource?: IpSource
}

export type IpSource =
  | "openai-chatgpt-user"
  | "openai-searchbot"
  | "openai-gptbot"
  | "googlebot"
  | "google-special"
  | "bingbot"
  | "applebot"
  | "perplexitybot"
  | "perplexity-user"
  | "duckduckbot"
  | "duckassistbot"
  | "mistral-user"
  | "ccbot"

const c = (
  id: string,
  name: string,
  company: string,
  category: CrawlerCategory,
  pattern: RegExp,
  ipSource?: IpSource
): Crawler => ({ id, name, company, category, pattern, ipSource })

export const CRAWLERS: readonly Crawler[] = [
  c(
    "chatgpt-user",
    "ChatGPT",
    "OpenAI",
    "answers",
    /ChatGPT-User/i,
    "openai-chatgpt-user"
  ),
  c(
    "oai-searchbot",
    "ChatGPT Search",
    "OpenAI",
    "indexing",
    /OAI-SearchBot/i,
    "openai-searchbot"
  ),
  c("gptbot", "GPTBot", "OpenAI", "training", /GPTBot/i, "openai-gptbot"),
  c("claude-user", "Claude", "Anthropic", "answers", /Claude-User/i),
  c(
    "claude-searchbot",
    "Claude Search",
    "Anthropic",
    "indexing",
    /Claude-SearchBot/i
  ),
  c(
    "claudebot",
    "ClaudeBot",
    "Anthropic",
    "training",
    /ClaudeBot|anthropic-ai/i
  ),
  c(
    "perplexity-user",
    "Perplexity",
    "Perplexity",
    "answers",
    /Perplexity-User/i,
    "perplexity-user"
  ),
  c(
    "perplexitybot",
    "PerplexityBot",
    "Perplexity",
    "indexing",
    /PerplexityBot/i,
    "perplexitybot"
  ),
  c(
    "mistral-user",
    "Le Chat",
    "Mistral",
    "answers",
    /MistralAI-User/i,
    "mistral-user"
  ),
  c(
    "duckassist",
    "DuckAssist",
    "DuckDuckGo",
    "answers",
    /DuckAssistBot/i,
    "duckassistbot"
  ),
  c("meta-fetcher", "Meta AI", "Meta", "answers", /meta-externalfetcher/i),
  c(
    "meta-agent",
    "Meta AI training",
    "Meta",
    "training",
    /meta-externalagent/i
  ),
  c(
    "vertex",
    "Gemini (Vertex)",
    "Google",
    "training",
    /Google-CloudVertexBot/i,
    "google-special"
  ),
  c(
    "googleother",
    "GoogleOther",
    "Google",
    "training",
    /GoogleOther/i,
    "googlebot"
  ),
  c("googlebot", "Googlebot", "Google", "indexing", /Googlebot/i, "googlebot"),
  c("bingbot", "Bingbot", "Microsoft", "indexing", /bingbot/i, "bingbot"),
  c("applebot", "Applebot", "Apple", "indexing", /Applebot/i, "applebot"),
  c(
    "duckduckbot",
    "DuckDuckBot",
    "DuckDuckGo",
    "indexing",
    /DuckDuckBot/i,
    "duckduckbot"
  ),
  c("yandexbot", "YandexBot", "Yandex", "indexing", /YandexBot/i),
  c("youbot", "YouBot", "You.com", "indexing", /YouBot/i),
  c("ccbot", "CCBot", "Common Crawl", "training", /CCBot/i, "ccbot"),
  c("bytespider", "Bytespider", "ByteDance", "training", /Bytespider/i),
  c("amazonbot", "Amazonbot", "Amazon", "training", /Amazonbot/i),
  c("cohere", "Cohere", "Cohere", "training", /cohere-(ai|training)/i),
  c("diffbot", "Diffbot", "Diffbot", "training", /Diffbot/i),
]

export function classifyCrawler(userAgent: string): Crawler | null {
  return CRAWLERS.find((crawler) => crawler.pattern.test(userAgent)) ?? null
}

export const CRAWLER_FILES =
  /^\/(robots\.txt|llms(-full)?\.txt|sitemap[^/]*\.xml)$/i
