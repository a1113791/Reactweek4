import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""],
};

function App() {
  const [isAuth, setIsAuth] = useState(false);

  const [products, setProducts] = useState([]);

  const [account, setAccount] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { value, name } = e.target;

    setAccount({
      ...account,
      [name]: value,
    });
  };

  const getProducts = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/v2/api/${API_PATH}/admin/products`
      );
      setProducts(res.data.products);
    } catch (error) {
      alert("取得產品失敗");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/v2/admin/signin`, account);

      const { token, expired } = res.data;
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;

      axios.defaults.headers.common["Authorization"] = token;

      getProducts();

      setIsAuth(true);
    } catch (error) {
      alert("登入失敗");
    }
  };

  const checkUserLogin = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/user/check`);
      getProducts();
      setIsAuth(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    axios.defaults.headers.common["Authorization"] = token;

    checkUserLogin();
  }, []);

  const productModalRef = useRef(null);
  const delProductModalRef = useRef(null);
  const [modalMode, setModalMode] = useState(null);

  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });
    new Modal(delProductModalRef.current, { backdrop: false });
  }, []);

  const handleOpenProductModal = (mode, product) => {
    setModalMode(mode);
    switch (mode) {
      case "create":
        setTempProduct(defaultModalState);
        break;
      case "edit":
        setTempProduct(product);
        break;
      default:
        break;
    }

    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  };

  const handleCloseProductModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
  };

  const handleOpenDelProductModal = (product) => {
    setTempProduct(product);
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.show();
  };
  const handleCloseDelProductModal = () => {
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.hide();
  };

  const [tempProduct, setTempProduct] = useState(defaultModalState);

  const handleModalInputChange = (e) => {
    const { value, name, checked, type } = e.target;

    setTempProduct({
      ...tempProduct,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e, index) => {
    const { value } = e.target;
    const newImages = [...tempProduct.imagesUrl];
    newImages[index] = value;
    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });
  };

  const handleAddImage = () => {
    const newImages = [...tempProduct.imagesUrl, ""];
    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });
  };
  const handleRemoveImage = () => {
    const newImages = [...tempProduct.imagesUrl];
    newImages.pop();
    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });
  };

  const createProduct = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`, {
        data: {
          ...tempProduct,
          origin_price: Number(tempProduct.origin_price),
          price: Number(tempProduct.price),
          is_enabled: tempProduct.is_enabled ? 1 : 0,
        },
      });
    } catch (error) {
      alert("新增產品失敗");
    }
  };

  const updateProduct = async () => {
    try {
      await axios.put(
        `${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`,
        {
          data: {
            ...tempProduct,
            origin_price: Number(tempProduct.origin_price),
            price: Number(tempProduct.price),
            is_enabled: tempProduct.is_enabled ? 1 : 0,
          },
        }
      );
    } catch (error) {
      alert("編輯產品失敗");
    }
  };

  const deleteProduct = async () => {
    try {
      await axios.delete(
        `${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`
      );
    } catch (error) {
      alert("刪除產品失敗");
    }
  };

  const handleUpdateProduct = async () => {
    const apiCall = modalMode === "create" ? createProduct : updateProduct;
    try {
      await apiCall();
      getProducts();
      handleCloseProductModal();
    } catch (error) {
      alert("更新產品失敗");
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct();
      getProducts();
      handleCloseDelProductModal();
    } catch (error) {
      alert("刪除商品失敗");
    }
  };

  return (
    <>
      {isAuth ? (
        <div className="container py-5">
          <div className="row">
            <div className="col">
              <div className="d-flex justify-content-between">
                <h2>產品列表</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleOpenProductModal("create")}
                >
                  建立新的產品
                </button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <th scope="row">{product.title}</th>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>
                        {product.is_enabled ? (
                          <span className="text-success">啟用</span>
                        ) : (
                          <span>未啟用</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                              handleOpenProductModal("edit", product)
                            }
                          >
                            編輯
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleOpenDelProductModal(product)}
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="d-flex justify-content-center">
            <nav>
              <ul className="pagination">
                <li className="page-item">
                  <a className="page-link" href="#">
                    上一頁
                  </a>
                </li>

                <li className="page-item">
                  <a className="page-link" href="#">
                    1
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    2
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    3
                  </a>
                </li>

                <li className="page-item">
                  <a className="page-link" href="#">
                    下一頁
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <h1 className="mb-5">請先登入</h1>
          <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <div className="form-floating mb-3">
              <input
                name="username"
                value={account.username}
                onChange={handleInputChange}
                type="email"
                className="form-control"
                id="username"
                placeholder="name@example.com"
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                name="password"
                value={account.password}
                onChange={handleInputChange}
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
              />
              <label htmlFor="password">Password</label>
            </div>
            <button className="btn btn-primary">登入</button>
          </form>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
      <div
        id="productModal"
        className="modal"
        ref={productModalRef}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">
                {modalMode === "create" ? "新增產品" : "編輯產品"}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleCloseProductModal}
              ></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                        value={tempProduct.imageUrl}
                        onChange={handleModalInputChange}
                      />
                    </div>
                    <img
                      src={tempProduct.imageUrl}
                      alt={tempProduct.title}
                      className="img-fluid"
                    />
                  </div>

                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          value={image}
                          onChange={(e) => handleImageChange(e, index)}
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}
                    <div className="btn-group w-100">
                      {tempProduct.imagesUrl.length < 5 &&
                        tempProduct.imagesUrl[
                          tempProduct.imagesUrl.length - 1
                        ] != "" && (
                          <button
                            onClick={handleAddImage}
                            className="btn btn-outline-primary btn-sm w-100"
                          >
                            新增圖片
                          </button>
                        )}
                      {tempProduct.imagesUrl.length > 1 && (
                        <button
                          onClick={handleRemoveImage}
                          className="btn btn-outline-danger btn-sm w-100"
                        >
                          取消圖片
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                      value={tempProduct.title}
                      onChange={handleModalInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                      value={tempProduct.category}
                      onChange={handleModalInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                      value={tempProduct.unit}
                      onChange={handleModalInputChange}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                        value={tempProduct.origin_price}
                        onChange={handleModalInputChange}
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                        value={tempProduct.price}
                        onChange={handleModalInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                      value={tempProduct.description}
                      onChange={handleModalInputChange}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                      value={tempProduct.content}
                      onChange={handleModalInputChange}
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                      checked={tempProduct.is_enabled}
                      onChange={handleModalInputChange}
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseProductModal}
              >
                取消
              </button>
              <button
                onClick={handleUpdateProduct}
                type="button"
                className="btn btn-primary"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={delProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleCloseDelProductModal}
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleDeleteProduct}
                type="button"
                className="btn btn-danger"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
