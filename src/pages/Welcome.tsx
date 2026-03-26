import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <Container className="text-center mt-5">
      <h1 className="mb-4">小说智能体</h1>
      <p className="lead mb-5">你的 AI 小说创作伙伴</p>

      <Row className="g-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>世界观智能体</Card.Title>
              <Card.Text>
                与你沟通，生成世界地图、势力分布、故事情节地点，并保存世界设计文件。
              </Card.Text>
              <Button variant="primary" as={Link} to="/world-builder">
                开始
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>角色塑造师</Card.Title>
              <Card.Text>
                与你沟通角色设计，包括外观、性格、背景、人物关系，并保存角色文件。
              </Card.Text>
              <Button variant="primary" as={Link} to="/character-designer">
                开始
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>大纲智能体</Card.Title>
              <Card.Text>
                与你沟通写作思路，生成世界构造、主线故事、人物设计，生成粗略大纲。
              </Card.Text>
              <Button variant="primary" as={Link} to="/outline-planner">
                开始
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>写作智能体</Card.Title>
              <Card.Text>
                阅读世界观、角色、大纲文件，生成单章节小说内容，并生成下一个章节。
              </Card.Text>
              <Button variant="primary" as={Link} to="/writer">
                开始
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="mt-5 text-muted">
        <p>首次使用请先配置 API</p>
        <Button variant="outline-primary" as={Link} to="/settings">
          前往设置
        </Button>
      </div>
    </Container>
  );
}
