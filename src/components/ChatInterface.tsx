import { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { Message } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  disabled?: boolean;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  onTypingChange,
  disabled = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || disabled || isTyping) return;

    onSendMessage(input.trim());
    setInput('');
    setIsTyping(true);
    onTypingChange?.(true);

    setTimeout(() => {
      setIsTyping(false);
      onTypingChange?.(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container fluid className="h-100 d-flex flex-column py-3">
      <Row className="flex-grow-1 overflow-auto mb-3">
        <Col>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <div className="flex-grow-1 overflow-auto">
                {messages.length === 0 && (
                  <div className="text-center text-muted mt-5">
                    <p>开始和智能体对话吧...</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`mb-3 d-flex ${
                      msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded ${
                        msg.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-light text-dark'
                      }`}
                      style={{ maxWidth: '70%', wordBreak: 'break-word' }}
                    >
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                      <small className={`d-block mt-1 ${msg.role === 'user' ? 'text-white-50' : 'text-muted'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="d-flex justify-content-start mb-3">
                    <div className="p-3 rounded bg-light">
                      <Spinner size="sm" animation="border" />
                      <span className="ms-2">思考中...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder={disabled ? '请先配置 API' : '输入消息...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || isTyping}
          />
          <Button
            variant="primary"
            className="mt-2 w-100"
            onClick={handleSend}
            disabled={disabled || isTyping || !input.trim()}
          >
            {isTyping ? '发送中...' : '发送'}
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
