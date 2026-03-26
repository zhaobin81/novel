import { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { Chapter, WorldDesign, Character, Outline } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

export default function Writer() {
  const [hasAPI, setHasAPI] = useState(false);
  const [worldDesign, setWorldDesign] = useState<WorldDesign | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [userRequest, setUserRequest] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config = storage.getAPIConfig();
    setHasAPI(!!config);

    setWorldDesign(storage.getWorldDesign());
    setCharacters(storage.getCharacters());
    setOutline(storage.getOutline());
    setChapters(storage.getChapters());
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [generatedContent]);

  const handleGenerateChapter = useCallback(async () => {
    if (!userRequest.trim()) {
      alert('请输入写作要求');
      return;
    }

    if (!outline) {
      alert('请先在大纲智能体中创建大纲');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setChapterTitle(`第${currentChapter}章`);

    const chapterOutline = outline.chapterOutlines.find(c => c.number === currentChapter);
    const skeleton = chapterOutline?.skeleton || chapterOutline?.content || userRequest;

    const contextPrompt = `
你是，一个专业的小说写作助手。请根据以下信息生成小说章节内容。

## 世界观设定
${worldDesign ? `
世界名称：${worldDesign.name}
${worldDesign.map ? `世界地图：${worldDesign.map}` : ''}
势力分布：
${worldDesign.factions.map(f => `- ${f.name}: ${f.description}`).join('\n')}
重要地点：
${worldDesign.locations.map(l => `- ${l.name}: ${l.description}`).join('\n')}
` : '暂无世界观设定，请根据常识创作'}

## 角色设定
${characters.length > 0 ? characters.map(c => `
- ${c.name}（${c.role || '未定义角色'}）
  外貌：${c.appearance || '未描述'}
  性格：${c.personality || '未描述'}
  背景：${c.background || '未描述'}
  关系：${c.relationships || '未描述'}
`).join('\n') : '暂无角色设定，请根据常识创作'}

## 大纲设定
${outline ? `
故事标题：${outline.title}
主线故事：${outline.mainStory || '未定义'}
${chapterOutline ? `
本章骨架：${chapterOutline.skeleton}
本章大纲：${chapterOutline.content}
` : ''}
` : '暂无大纲设定'}

## 用户写作要求
${userRequest}

请生成符合上述设定的精彩小说章节内容。要求：
1. 字数在 2000-3000 字左右
2. 情节生动、人物鲜活
3. 善用场景描写、对话、内心独白
4. 注意起承转合，情节有张力
5. 直接输出章节内容，不需要额外说明
`;

    try {
      await api.sendMessage(
        [],
        contextPrompt,
        (chunk) => {
          setGeneratedContent(prev => prev + chunk);
        }
      );
    } catch (error) {
      setGeneratedContent(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [userRequest, worldDesign, characters, outline, currentChapter]);

  const handleSaveChapter = () => {
    if (!generatedContent.trim()) {
      alert('请先生成章节内容');
      return;
    }

    const chapter: Chapter = {
      id: uuidv4(),
      number: currentChapter,
      title: chapterTitle || `第${currentChapter}章`,
      content: generatedContent,
      outlineId: outline?.id || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const existingIndex = chapters.findIndex(c => c.number === currentChapter);
    if (existingIndex >= 0) {
      const updated = [...chapters];
      updated[existingIndex] = { ...chapter, id: chapters[existingIndex].id };
      storage.setChapters(updated);
      setChapters(updated);
    } else {
      storage.addChapter(chapter);
      setChapters([...chapters, chapter]);
    }

    alert('章节已保存！');
  };

  const handleNextChapter = () => {
    if (!generatedContent.trim()) {
      alert('请先生成并保存当前章节');
      return;
    }
    setCurrentChapter(prev => prev + 1);
    setGeneratedContent('');
    setChapterTitle('');
    setUserRequest('');
  };

  const handleLoadChapter = (chapter: Chapter) => {
    setCurrentChapter(chapter.number);
    setChapterTitle(chapter.title);
    setGeneratedContent(chapter.content);
  };

  return (
    <Container fluid className="h-100 py-3">
      <Row className="h-100">
        <Col md={3} className="border-end">
          <h5 className="mb-3">参考资料</h5>

          <Card className="mb-3">
            <Card.Header className="py-2">
              <strong>世界观</strong>
            </Card.Header>
            <Card.Body className="p-2">
              {worldDesign ? (
                <small>
                  <div><strong>{worldDesign.name}</strong></div>
                  <div className="text-muted">势力: {worldDesign.factions.length}</div>
                  <div className="text-muted">地点: {worldDesign.locations.length}</div>
                </small>
              ) : (
                <small className="text-muted">暂无世界观设定</small>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="py-2">
              <strong>角色 ({characters.length})</strong>
            </Card.Header>
            <Card.Body className="p-2">
              {characters.length > 0 ? (
                <small>
                  {characters.map(c => (
                    <div key={c.id}>{c.name}（{c.role || '未知'})</div>
                  ))}
                </small>
              ) : (
                <small className="text-muted">暂无角色设定</small>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="py-2">
              <strong>大纲</strong>
            </Card.Header>
            <Card.Body className="p-2">
              {outline ? (
                <small>
                  <div><strong>{outline.title}</strong></div>
                  <div className="text-muted">章节: {outline.chapterOutlines.length}</div>
                </small>
              ) : (
                <small className="text-muted">暂无大纲设定</small>
              )}
            </Card.Body>
          </Card>

          <h5 className="mb-2">已保存章节 ({chapters.length})</h5>
          <div style={{ maxHeight: 'calc(100vh - 500px)', overflowY: 'auto' }}>
            {chapters.length === 0 && (
              <small className="text-muted">暂无已保存章节</small>
            )}
            {chapters.map(chapter => (
              <Card
                key={chapter.id}
                className="mb-2"
                style={{ cursor: 'pointer' }}
                onClick={() => handleLoadChapter(chapter)}
              >
                <Card.Body className="p-2">
                  <small>
                    <strong>{chapter.title}</strong>
                    <div className="text-muted">{chapter.content.length} 字</div>
                  </small>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Col>

        <Col md={9}>
          {!hasAPI && (
            <Alert variant="warning" className="mb-3">
              请先配置 API 设置
            </Alert>
          )}

          {!outline && (
            <Alert variant="info" className="mb-3">
              建议先去大纲智能体创建大纲，以获得更好的写作体验
            </Alert>
          )}

          <Card className="mb-3">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span>第 {currentChapter} 章</span>
                <Form.Control
                  type="text"
                  value={chapterTitle}
                  onChange={e => setChapterTitle(e.target.value)}
                  placeholder="章节标题"
                  style={{ width: '200px' }}
                />
              </div>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>写作要求（可选，AI会根据大纲自动生成）</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={userRequest}
                  onChange={e => setUserRequest(e.target.value)}
                  placeholder="输入你想要的章节内容描述，或留空让AI根据大纲生成..."
                  disabled={isGenerating}
                />
              </Form.Group>

              <div
                ref={contentRef}
                style={{
                  maxHeight: 'calc(100vh - 450px)',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'serif',
                  fontSize: '16px',
                  lineHeight: '1.8',
                  padding: '10px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  minHeight: '200px',
                  backgroundColor: '#fafafa'
                }}
              >
                {generatedContent || '点击"生成章节"开始创作...'}
              </div>

              {isGenerating && (
                <div className="mt-2">
                  <Spinner size="sm" animation="border" />
                  <span className="ms-2">生成中...</span>
                </div>
              )}
            </Card.Body>
          </Card>

          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={handleGenerateChapter}
              disabled={isGenerating || !hasAPI}
            >
              {isGenerating ? '生成中...' : '生成章节'}
            </Button>
            <Button
              variant="success"
              onClick={handleSaveChapter}
              disabled={!generatedContent.trim() || isGenerating}
            >
              保存章节
            </Button>
            <Button
              variant="info"
              onClick={handleNextChapter}
              disabled={!generatedContent.trim() || isGenerating}
            >
              下一章
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
